// Profile Page - User profile details and account management
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiCalendar, FiShield, FiEdit2, FiSave, FiLogOut, FiHash, FiMapPin, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, userRole, customerId, address, logout, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.displayName || '');
    const [editAddress, setEditAddress] = useState({
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
        phone: address?.phone || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        setSaving(true);
        try {
            await updateUserProfile(name.trim(), editAddress);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
        setSaving(false);
    };

    const dateJoined = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Unknown';

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    {/* Header/Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg border-4 border-white">
                                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user?.displayName || 'User'}</h1>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={saving}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all ${isEditing
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } disabled:opacity-50`}
                            >
                                {isEditing ? <><FiSave /> {saving ? 'Saving...' : 'Save Details'}</> : <><FiEdit2 /> Edit Profile</>}
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Display Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiUser />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            disabled={!isEditing}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all disabled:opacity-70"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiMail />
                                        </div>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none opacity-70"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Customer ID</label>
                                    <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100">
                                        <FiHash />
                                        <span className="font-semibold">{customerId || 'N/A'}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Account Role</label>
                                    <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-100">
                                        <FiShield />
                                        <span className="font-semibold capitalize">{userRole || 'User'}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Member Since</label>
                                    <div className="flex items-center gap-3 bg-gray-50 text-gray-600 px-4 py-3 rounded-xl border border-gray-100">
                                        <FiCalendar />
                                        <span className="font-semibold">{dateJoined}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FiMapPin className="text-blue-600" /> Delivery Address</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Street / House No.</label>
                                    <input
                                        type="text"
                                        value={editAddress.street}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditAddress({ ...editAddress, street: e.target.value })}
                                        placeholder="Enter your street address"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all disabled:opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">City</label>
                                    <input
                                        type="text"
                                        value={editAddress.city}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                                        placeholder="City"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all disabled:opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">State</label>
                                    <input
                                        type="text"
                                        value={editAddress.state}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                                        placeholder="State"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all disabled:opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        value={editAddress.pincode}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value })}
                                        placeholder="Pincode"
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all disabled:opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiPhone />
                                        </div>
                                        <input
                                            type="tel"
                                            value={editAddress.phone}
                                            disabled={!isEditing}
                                            onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
                                            placeholder="Phone number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all disabled:opacity-70"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Sign Out</h3>
                                <p className="text-sm text-gray-500">Log out from your account on this device</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all"
                            >
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
