import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();
    const [userInput, setUserInput] = useState({});
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => {
        setUserInput({ ...userInput, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const login = await axios.post('/api/auth/login', userInput);
            const data = login.data;

            if (data.success === false) {
                setLoading(false);
                toast.error(data.message);
                return;
            }

            toast.success(data.message);
            localStorage.setItem('chatapp', JSON.stringify(data));
            setAuthUser(data);
            setLoading(false);
            navigate('/');
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-[400px] sm:w-[450px] md:w-[500px] p-6 rounded-lg shadow-xl bg-gray-100 backdrop-filter backdrop-blur-lg bg-opacity-50">
                <h1 className="text-3xl font-bold text-center text-blue-900">WHISPR</h1>
                <h2 className="text-2xl font-semibold text-center text-gray-800 mt-2">Login</h2>

                <form onSubmit={handleSubmit} className="flex flex-col text-black mt-4">
                    <div>
                        <label className="font-semibold text-gray-700 text-lg">Email:</label>
                        <input
                            id="email"
                            type="email"
                            onChange={handleInput}
                            placeholder="Enter your email"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1"
                        />
                    </div>

                    <div className="mt-3">
                        <label className="font-semibold text-gray-700 text-lg">Password:</label>
                        <input
                            id="password"
                            type="password"
                            onChange={handleInput}
                            placeholder="Enter your password"
                            required
                            className="w-full input input-bordered h-11 rounded-lg px-3 mt-1"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-5 w-full py-3 bg-blue-900 text-white text-lg font-semibold rounded-lg hover:bg-blue-800 transition-all duration-300 ease-in-out"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="pt-4 text-center">
                    <p className="text-gray-700 text-lg">
                        Don't have an account?{' '}
                        <Link to={'/register'}>
                            <span className="text-blue-900 font-semibold underline cursor-pointer hover:text-blue-800">
                                Register Now!
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
