import React, { useState } from 'react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // ...existing code...
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ width: 320, padding: 24, border: '1px solid orange', borderRadius: 8 }}>
                <h2 style={{ color: 'orange' }}>Register</h2>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 12, borderColor: 'orange' }}
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 12, borderColor: 'orange' }}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 12, borderColor: 'orange' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', backgroundColor: 'orange', color: 'white' }}>Register</button>
            </form>
        </div>
    );
};

export default Register;