import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
    const [toggle, setToggle] = useState(true);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userForm, setUserForm] = useState({
        fullName: '', userName: '', role: ''
    });
    const [isEdit, setIsEdit] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/users/api/getAllusers');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to fetch users.');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(async () => {
            const apiURL = isEdit
                ? `http://localhost:8080/users/api/updateUser/${currentUser.userId}`
                : 'http://localhost:8080/users/api/addUser';
            const method = isEdit ? 'PUT' : 'POST';
            try {
                const res = await fetch(apiURL, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userForm)
                });
                if(isEdit){
                    if(res){
                        toast.success("User updated successfully !!")
                        fetchAllUsers()
                        setUserForm({
                            fullName: '', userName: '', role: ''
                        })
                        setIsEdit(false)
                        setToggle(toggle=>!toggle)
                        return
                    }
                }
                const data = await res.json();
                console.log('Response Data:', data);

                if (data.Status === "true") {
                    toast.success(data.Message);
                    setUserForm({ fullName: '', userName: '', role: '' });
                    setIsEdit(false);
                    fetchAllUsers();
                    setToggle(true);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message || 'Failed to submit user.');
                console.error('Error:', error);
            }
            setLoading(false);
        }, 2000);
    };

    const deleteUser = async (userId) => {
        setLoading(true);
        setTimeout(async()=>{

            const apiURL = `http://localhost:8080/users/api/deleteUser/${userId}`;
                const res = await fetch(apiURL, {
                    method: 'DELETE',
                });
                setLoading(false);
                if (res) {
                    toast.success('User Deleted Successfully !!');
                    fetchAllUsers(); 
                }else{
                    toast.error('Failed to delete user');
                }
        },1000)
    };

    const editUser = (user) => {
        setCurrentUser(user);
        setUserForm({
            fullName: user.fullName,
            userName: user.userName,
            role: user.role
        });
        setIsEdit(true);
        setToggle(false); 
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <>
            {
                loading &&
                <div className="loader">
                    <div className="box"></div>
                </div>
            }
            <Toaster />
            <div className="header">
                <h2>User Management</h2>
                <button onClick={() => {
                    setToggle(!toggle);
                    setIsEdit(false);
                    setUserForm({ fullName: '', userName: '', role: '' });
                }}>
                    {toggle ? "Add user" : "Back to list"} <i className="fa-solid fa-plus"></i>
                </button>
            </div>
            {
                !toggle ? (
                    <div className='center'> <form onSubmit={handleSubmit}>
                        <div className="title">{isEdit ? "Edit User" : "Add User"}</div>
                        <div className="input-field">
                            <label>Fullname:</label>
                            <input type="text" name="fullName" value={userForm.fullName} onChange={handleChange} />
                        </div>
                        <div className="input-field">
                            <label>Username:</label>
                            <input type="text" name="userName" value={userForm.userName} onChange={handleChange} />
                        </div>
                        <div className="input-field">
                            <label>Role:</label>
                            <select name="role" value={userForm.role} onChange={handleChange}>
                                <option value=''>SELECT ROLE</option>
                                <option value="Client">Client</option>
                                <option value="Admin">Admin</option>
                                <option value="Courier">Courier</option>
                                <option value="CEO">CEO</option>
                                <option value="Operative">Operative</option>
                            </select>
                        </div>
                        <div className='input-field'>
                            <button type="submit">{isEdit ? "Update" : "Submit"}</button>
                        </div>
                    </form></div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fullname</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                users.length > 0 ?
                                    users.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.fullName}</td>
                                            <td>{item.userName}</td>
                                            <td>{item.role}</td>
                                            <td>
                                                <div className="actions">
                                                    <button onClick={() => deleteUser(item.userId)}><i className="fa-solid fa-user-minus"></i></button>
                                                    <button onClick={() => editUser(item)}><i className="fa-solid fa-user-pen"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) :
                                    <tr>
                                        <td colSpan="5">No users found</td>
                                    </tr>
                            }
                        </tbody>
                    </table>
                )
            
            }
        </>
    );
}
