import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [inputData, setInputData] = useState({});

    const handelInput = (e) => {
        setInputData({
            ...inputData, [e.target.id]: e.target.value
        });
    }

    const selectGender = (selectGender) => {
        setInputData((prev) => ({
            ...prev, gender: selectGender === inputData.gender ? '' : selectGender
        }));
    }

    const handelSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("first check");
        if (inputData.password !== inputData.confpassword) {
            setLoading(false);
            return toast.error("Passwords don't match");
        }
        console.log("first check complete");

        try {
            console.log("i will try");
            const register = await axios.post('/api/auth/register', inputData);
            console.log(register);
            console.log("request sended");
            const data = register.data;
            
            if (data.success === false) {
                console.log("success false");
                setLoading(false);
                toast.error(data.message);
                console.log(data.message);
            }
            console.log("register succeded");
            toast.success(data?.message);
            localStorage.setItem('chatapp', JSON.stringify(data));
            setAuthUser(data);
            setLoading(false);
            navigate('/login');
        } catch (error) {
            console.log("register error");
            setLoading(false);
            console.log(error);
            const errorMessage = error?.response?.data?.message;
            toast.error(errorMessage);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center mix-w-full mx-auto">
            <div className="w-full p-6 rounded-lg shadow-lg bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0">
               
                <h1 className='text-3xl font-bold text-center text-blue-950 my-6'> WHISPR</h1>
                <h2 className="text-3xl font-bold text-center text-black">Register</h2>
                <form onSubmit={handelSubmit} className="flex flex-col text-black">
                    <div>
                        <label className="label p-2">
                            <span className="font-bold text-gray-950 text-xl label-text">Fullname:</span>
                        </label>
                        <input
                            id="fullname"
                            type="text"
                            onChange={handelInput}
                            placeholder="Enter Full Name"
                            required
                            className="w-full input input-bordered h-10"
                        />
                    </div>
                    <div>
                        <label className="label p-2">
                            <span className="font-bold text-gray-950 text-xl label-text">Username:</span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            onChange={handelInput}
                            placeholder="Enter Username"
                            required
                            className="w-full input input-bordered h-10"
                        />
                    </div>
                    <div>
                        <label className="label p-2">
                            <span className="font-bold text-gray-950 text-xl label-text">Email:</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            onChange={handelInput}
                            placeholder="Enter email"
                            required
                            className="w-full input input-bordered h-10"
                        />
                    </div>
                    <div>
                        <label className="label p-2">
                            <span className="font-bold text-gray-950 text-xl label-text">Password:</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            onChange={handelInput}
                            placeholder="Enter password"
                            required
                            className="w-full input input-bordered h-10"
                        />
                    </div>
                    <div>
                        <label className="label p-2">
                            <span className="font-bold text-gray-950 text-xl label-text">Conf.Password:</span>
                        </label>
                        <input
                            id="confpassword"
                            type="text"
                            onChange={handelInput}
                            placeholder="Enter Confirm password"
                            required
                            className="w-full input input-bordered h-10"
                        />
                    </div>

                    <div id="gender" className="flex gap-2">
                        <label className="cursor-pointer label flex gap-2">
                            <span className="label-text font-semibold text-gray-950">Male</span>
                            <input
                                onChange={() => selectGender('male')}
                                checked={inputData.gender === 'male'}
                                type="radio"
                                className="radio radio-info"
                                name="gender"
                            />
                        </label>
                        <label className="cursor-pointer label flex gap-2">
                            <span className="label-text font-semibold text-gray-950">Female</span>
                            <input
                                onChange={() => selectGender('female')}
                                checked={inputData.gender === 'female'}
                                type="radio"
                                className="radio radio-info"
                                name="gender"
                            />
                        </label>
                    </div>

                    <button type="submit" className="mt-4 self-center w-auto px-2 py-1 bg-gray-950 text-lg hover:bg-gray-900 text-white rounded-lg hover:scale-105">
                        {loading ? 'Loading...' : 'Register'}
                    </button>
                </form>

                <div className="pt-2">
                    <p className="text-sm font-semibold text-gray-800">
                        Don't have an account? <Link to={'/login'}>
                            <span className="text-gray-950 font-bold underline cursor-pointer hover:text-green-950">Login Now!!</span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
