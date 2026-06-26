import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { UserCircle, Shield, BellRing, Palette, Save } from "lucide-react";

const SettingsTemplate = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="p-2.5 bg-[#171C2D] text-[#F4B400] rounded-xl flex items-center justify-center shadow-inner">
                <Icon size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0F172A] leading-tight">{title}</h2>
            </div>
        </div>
        <div className="p-8 flex-1">
            {children}
            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button className="bg-[#171C2D] text-white hover:bg-[#F4B400] hover:text-[#171C2D] font-bold py-3 pt-3.5 px-6 rounded-xl flex items-center gap-2 transition-colors duration-300 shadow-md">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
    </div>
);

const FormLabel = ({ children }) => <label className="block text-sm font-bold text-[#0F172A] mb-1.5">{children}</label>;

const FormInput = ({ type = "text", placeholder, defaultValue }) => (
    <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/50 focus:border-[#F4B400] transition-colors"
    />
);

const ToggleSwitch = ({ checked, label }) => {
    const [isOn, setIsOn] = useState(checked);
    return (
        <div
            onClick={() => setIsOn(!isOn)}
            className="flex items-center gap-4 cursor-pointer group"
        >
            <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 shadow-inner ${isOn ? 'bg-[#22C55E]' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#F4B400] transition-colors select-none">{label}</span>
        </div>
    );
}

const MyProfile = () => (
    <SettingsTemplate title="My Profile" icon={UserCircle}>
        <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-[#171C2D] text-[#F4B400] text-3xl font-black rounded-3xl flex items-center justify-center border-[3px] border-[#F4B400] shadow-md">
                    SM
                </div>
                <div>
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors mb-2">Change Avatar</button>
                    <p className="text-xs font-semibold text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div><FormLabel>First Name</FormLabel><FormInput defaultValue="System" /></div>
                <div><FormLabel>Last Name</FormLabel><FormInput defaultValue="Admin" /></div>
            </div>
            <div>
                <FormLabel>Email Address</FormLabel>
                <FormInput type="email" defaultValue="admin@maestrominds.com" />
            </div>
            <div>
                <FormLabel>Phone Number</FormLabel>
                <FormInput type="tel" defaultValue="+1 (555) 000-0000" />
            </div>
        </div>
    </SettingsTemplate>
);

const Security = () => (
    <SettingsTemplate title="Security & Login" icon={Shield}>
        <div className="max-w-xl space-y-6">
            <div>
                <FormLabel>Current Password</FormLabel>
                <FormInput type="password" placeholder="••••••••" />
            </div>
            <div>
                <FormLabel>New Password</FormLabel>
                <FormInput type="password" placeholder="••••••••" />
                <p className="text-xs font-semibold text-slate-400 mt-1">Must be at least 8 characters. Must contain a number.</p>
            </div>
            <div>
                <FormLabel>Confirm New Password</FormLabel>
                <FormInput type="password" placeholder="••••••••" />
            </div>

            <hr className="border-slate-100 my-6" />

            <h3 className="font-black text-[#0F172A] mb-4">Two-Factor Authentication</h3>
            <ToggleSwitch checked={false} label="Enable 2FA via SMS or Authenticator App" />
            <p className="text-xs font-medium text-slate-500 mt-2 pl-16">Adds an additional layer of security to your admin account.</p>
        </div>
    </SettingsTemplate>
);

const Notifications = () => (
    <SettingsTemplate title="Notification Preferences" icon={BellRing}>
        <div className="max-w-xl space-y-6">
            <h3 className="font-black text-[#0F172A] mb-2">Email Notifications</h3>
            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <ToggleSwitch checked={true} label="Lead Assignment Alerts" />
                <ToggleSwitch checked={true} label="Daily Summary Reports" />
                <ToggleSwitch checked={false} label="New Registration Pings" />
            </div>

            <h3 className="font-black text-[#0F172A] mb-2 mt-8">In-App Alerts</h3>
            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <ToggleSwitch checked={true} label="Show Follow-up Reminders" />
                <ToggleSwitch checked={true} label="Site Visit Notifications" />
            </div>
        </div>
    </SettingsTemplate>
);

const Appearance = () => (
    <SettingsTemplate title="System Appearance" icon={Palette}>
        <div className="max-w-xl space-y-6">
            <h3 className="font-black text-[#0F172A] mb-4">Theme Preference</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-[#F4B400] bg-slate-50 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer">
                    <div className="w-16 h-12 bg-white border border-slate-200 rounded shadow-sm"></div>
                    <span className="font-bold text-[#0F172A] text-sm">Light Mode</span>
                </div>
                <div className="border border-slate-200 bg-slate-50 opacity-50 rounded-xl p-4 flex flex-col items-center gap-3 cursor-not-allowed">
                    <div className="w-16 h-12 bg-slate-800 rounded shadow-sm flex items-center justify-center text-xs">Soon</div>
                    <span className="font-bold text-[#0F172A] text-sm">Dark Mode</span>
                </div>
            </div>
        </div>
    </SettingsTemplate>
);

export default function Settings() {
    const location = useLocation();

    return (
        <AdminLayout>
            <div className="p-8 pb-20 max-w-5xl mx-auto flex gap-8">
                {/* Fixed side config menu hidden on mobile */}
                <div className="hidden lg:block w-64 shrink-0 space-y-1 sticky top-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4 mb-4">System Configurations</h3>

                    {[
                        { id: "profile", label: "My Profile", icon: UserCircle },
                        { id: "security", label: "Security", icon: Shield },
                        { id: "notifications", label: "Notifications", icon: BellRing },
                        { id: "appearance", label: "Appearance", icon: Palette },
                    ].map(tab => {
                        const isActive = location.pathname.includes(tab.id);
                        return (
                            <Link
                                key={tab.id}
                                to={`/admin/settings/${tab.id}`}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#171C2D] text-white shadow-md font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'}`}
                            >
                                <tab.icon size={18} className={isActive ? "text-[#F4B400]" : "text-slate-400"} />
                                {tab.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex-1 min-w-0">
                    <Routes>
                        <Route path="/" element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<MyProfile />} />
                        <Route path="security" element={<Security />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="appearance" element={<Appearance />} />
                    </Routes>
                </div>
            </div>
        </AdminLayout>
    );
}
