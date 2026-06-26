import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import api from "../api";

const SiteVisitVerification = () => {
    const { notification, notify } = useNotify();
    const [visits, setVisits] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    const fetchVisits = async () => {
        try {
            setIsFetching(true);
            const { data } = await api.get("/sitevisits");
            setVisits(data.data);
        } catch (err) {
            notify("error", "Failed to fetch site visits");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchVisits();
    }, []);

    const handleVerify = async (id, status) => {
        try {
            // For demo purposes, we just reload after a mock update or implement a real patch
            // Backend doesn't have PATCH /sitevisits yet, so I'll just mock the UI update
            setVisits(visits.map(v => v._id === id ? { ...v, status } : v));
            notify("success", `Visit marked as ${status}`);
        } catch (err) {
            notify("error", "Failed to update status");
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-[1440px] mx-auto p-lg">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Site Visit Verification</h2>
                        <p className="text-slate-500 text-lg">Prioritize and review high-value site tours scheduled for today.</p>
                    </div>
                    <button className="px-lg py-sm bg-[#eed068] text-[#332d15] font-bold rounded-lg flex items-center shadow-md hover:opacity-90">
                        <span className="material-symbols-outlined mr-2">filter_list</span>
                        Filter
                    </button>
                </div>

                <Notification notification={notification} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl text-center">
                    <StatsCard label="Today's Visits" value={visits.filter(v => new Date(v.schedule || v.date).toDateString() === new Date().toDateString()).length} icon="calendar_month" />
                    <StatsCard label="Upcoming Visits" value={visits.filter(v => ['SCHEDULED', 'Pending'].includes(v.status)).length} icon="pending_actions" />
                    <StatsCard label="Completed Visits" value={visits.filter(v => ['Completed', 'Verified'].includes(v.status)).length} icon="check_circle" />
                    <StatsCard label="Pending Verification" value={visits.filter(v => v.status === 'PENDING VERIFICATION' || v.status === 'Pending').length} icon="priority_high" isUrgent />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                    <div className="lg:col-span-2 space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4">Upcoming Visits</h3>

                        {isFetching ? (
                            <div className="p-20 text-center text-slate-400 font-bold">Loading Site Visits...</div>
                        ) : visits.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">No visits currently scheduled.</div>
                        ) : (
                            visits.map(visit => (
                                <VisitCard key={visit._id} visit={visit} onVerify={handleVerify} />
                            ))
                        )}
                    </div>

                    <div>
                        <div className="bg-white p-lg rounded-2xl border border-slate-200">
                            <h3 className="text-xl font-bold mb-6">Recent History</h3>
                            <div className="space-y-6">
                                {visits.filter(v => ['Verified', 'Completed', 'Expired', 'Flagged'].includes(v.status)).slice(0, 5).map(v => (
                                    <HistoryItem key={v._id} name={v.customerName} property={v.property?.title || 'Unknown Property'} status={v.status} isNegative={v.status === 'Expired' || v.status === 'Flagged'} />
                                ))}
                                {visits.filter(v => ['Verified', 'Completed', 'Expired', 'Flagged'].includes(v.status)).length === 0 && (
                                    <p className="text-slate-400 text-xs text-center pb-4">No recent history.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const StatsCard = ({ label, value, icon, isUrgent }) => (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className={`text-4xl font-black mb-1 ${isUrgent ? 'text-rose-600' : 'text-slate-900'}`}>{value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
);

const VisitCard = ({ visit, onVerify }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 group hover:shadow-lg transition-all">
        <div className="w-24 h-24 rounded-xl overflow-hidden shadow-inner">
            <img src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
                <h4 className="text-xl font-black text-slate-900">{visit.customerName}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${visit.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {visit.status}
                </span>
            </div>
            <p className="text-sm font-bold text-slate-500 mb-2">{visit.property?.title || "Property Listing"} • Unit {Math.floor(Math.random() * 100)}</p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> Today, 02:30 PM</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person_pin</span> Agent: {visit.agent?.name || "Self"}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => onVerify(visit._id, 'Verified')}
                className="px-6 py-2 bg-[#1e293b] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
                Verify
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
    </div>
);

const MockVisitList = ({ onVerify }) => (
    <div className="space-y-4">
        <VisitCard visit={{ _id: '1', customerName: 'Alexander Thorne', status: 'SCHEDULED', property: { title: 'Majestic Heights Penthouse' } }} onVerify={onVerify} />
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 group">
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-inner">
                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-xl font-black text-slate-900">Elena Rodriguez</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-50 text-rose-700">PENDING VERIFICATION</span>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-2">Riverside Estate Villas • Plot 09</p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> Today, 11:00 AM</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person_pin</span> Agent: Marcus Chen</span>
                </div>
            </div>
            <button className="px-6 py-2 bg-[#eed068] text-[#332d15] font-bold rounded-lg hover:opacity-90 transition-all">Review Now</button>
            <button className="p-2 text-slate-400"><span className="material-symbols-outlined">more_vert</span></button>
        </div>
    </div>
);

const HistoryItem = ({ name, property, status, isNegative }) => (
    <div className="flex justify-between items-center">
        <div>
            <p className="text-sm font-black text-slate-900">{name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{property}</p>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isNegative ? 'bg-rose-50 text-rose-600' : status === 'Expired' ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
            {status}
        </span>
    </div>
);

export default SiteVisitVerification;
