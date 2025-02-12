import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [inputData, setInputData] = useState({});

    const handelInput = (e) => {
        setInputData({
            ...inputData,
            [e.target.id]: e.target.value
        });
    };

    const selectGender = (selectGender) => {
        setInputData((prev) => ({
            ...prev,
            gender: selectGender === inputData.gender ? '' : selectGender
        }));
    };

    const handelSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (inputData.password !== inputData.confpassword) {
            setLoading(false);
            return toast.error("Passwords don't match");
        }

        try {
            const register = await axios.post('/api/auth/register', inputData);
            const data = register.data;

            if (data.success === false) {
                setLoading(false);
                toast.error(data.message);
                return;
            }

            toast.success(data?.message);
            localStorage.setItem('chatapp', JSON.stringify(data));
            setAuthUser(data);
            setLoading(false);
            navigate('/login');
        } catch (error) {
            setLoading(false);
            const errorMessage = error?.response?.data?.message;
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-[400px] sm:w-[450px] md:w-[500px] lg:w-[550px] p-6 rounded-lg shadow-xl bg-gray-100">
                <h1 className="text-3xl font-bold text-center text-blue-900">WHISPR</h1>
                <h2 className="text-2xl font-semibold text-center text-gray-800 mt-2">Register</h2>

                <form onSubmit={handelSubmit} className="flex flex-col text-black">
                    <div>
                        <label className="font-semibold text-white-700 text-lg">Full Name:</label>
                        <input
                            id="fullname"
                            type="text"
                            onChange={handelInput}
                            placeholder="Enter Full Name"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1 text-white"
                        />
                    </div>

                    <div className="mt-3">
                        <label className="font-semibold text-gray-700 text-lg">Username:</label>
                        <input
                            id="username"
                            type="text"
                            onChange={handelInput}
                            placeholder="Enter Username"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1 text-white"
                        />
                    </div>

                    <div className="mt-3">
                        <label className="font-semibold text-gray-700 text-lg">Email:</label>
                        <input
                            id="email"
                            type="email"
                            onChange={handelInput}
                            placeholder="Enter Email"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1 text-white"
                        />
                    </div>

                    <div className="mt-3">
                        <label className="font-semibold text-gray-700 text-lg">Password:</label>
                        <input
                            id="password"
                            type="password"
                            onChange={handelInput}
                            placeholder="Enter Password"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1 text-white"
                        />
                    </div>

                    <div className="mt-3">
                        <label className="font-semibold text-gray-700 text-lg">Confirm Password:</label>
                        <input
                            id="confpassword"
                            type="password"
                            onChange={handelInput}
                            placeholder="Confirm Password"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1 text-white"
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="flex gap-6 mt-4">
                        <label className="cursor-pointer flex items-center gap-2">
                            <span className="text-gray-800 font-medium">Male</span>
                            <input
                                onChange={() => selectGender('male')}
                                checked={inputData.gender === 'male'}
                                type="radio"
                                className="radio radio-info"
                                name="gender"
                            />
                        </label>
                        <label className="cursor-pointer flex items-center gap-2">
                            <span className="text-gray-800 font-medium">Female</span>
                            <input
                                onChange={() => selectGender('female')}
                                checked={inputData.gender === 'female'}
                                type="radio"
                                className="radio radio-info"
                                name="gender"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="mt-5 w-full py-3 bg-blue-900 text-white text-lg font-semibold rounded-lg hover:bg-blue-800 transition-all duration-300 ease-in-out"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="pt-4 text-center">
                    <p className="text-gray-700 text-lg">
                        Already have an account?{' '}
                        <Link to={'/login'}>
                            <span className="text-blue-900 font-semibold underline cursor-pointer hover:text-blue-800">
                                Login Now!
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
