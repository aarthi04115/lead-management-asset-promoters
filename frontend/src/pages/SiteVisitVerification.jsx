import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import api from "../api";
import SiteVisitModal from "../components/admin/SiteVisitModal";

const SiteVisitVerification = () => {
    const { notification, notify } = useNotify();
    const [visits, setVisits] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);

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

    const handleAction = async (id, action) => {
        try {
            let endpoint = `/sitevisits/${id}`;
            if (action === 'approve') endpoint += '/approve';
            else if (action === 'reject') endpoint += '/reject';

            if (action === 'delete') {
                if (!window.confirm("Are you sure you want to delete this record?")) return;
                await api.delete(endpoint);
            } else {
                await api.put(endpoint);
            }

            notify("success", `Visit ${action}ed successfully`);
            fetchVisits();
        } catch (err) {
            notify("error", `Failed to ${action} visit`);
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
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-lg py-sm bg-slate-900 text-white font-bold rounded-lg flex items-center shadow-md hover:opacity-90"
                    >
                        <span className="material-symbols-outlined mr-2">add_circle</span>
                        Add New Visit
                    </button>
                </div>

                <Notification notification={notification} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl text-center">
                    <StatsCard label="Today's Visits" value={visits.filter(v => new Date(v.visitTime || v.createdAt).toDateString() === new Date().toDateString()).length} icon="calendar_month" />
                    <StatsCard label="Pending" value={visits.filter(v => v.status === 'Pending').length} icon="pending_actions" />
                    <StatsCard label="Approved" value={visits.filter(v => v.status === 'Approved').length} icon="check_circle" />
                    <StatsCard label="Rejected" value={visits.filter(v => v.status === 'Rejected').length} icon="cancel" isUrgent />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                    <div className="lg:col-span-2 space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4">Verification Queue</h3>

                        {isFetching ? (
                            <div className="p-20 text-center text-slate-400 font-bold">Loading Site Visits...</div>
                        ) : visits.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">No visits found.</div>
                        ) : (
                            visits.map(visit => (
                                <VisitCard key={visit._id} visit={visit} onAction={handleAction} />
                            ))
                        )}
                    </div>

                    <div>
                        <div className="bg-white p-lg rounded-2xl border border-slate-200">
                            <h3 className="text-xl font-bold mb-6">Recent History</h3>
                            <div className="space-y-6">
                                {visits.filter(v => ['Approved', 'Rejected'].includes(v.status)).slice(0, 5).map(v => (
                                    <HistoryItem key={v._id} name={v.customerName} property={v.propertyName || 'Unknown Property'} status={v.status} isNegative={v.status === 'Rejected'} />
                                ))}
                                {visits.filter(v => ['Approved', 'Rejected'].includes(v.status)).length === 0 && (
                                    <p className="text-slate-400 text-xs text-center pb-4">No recent history.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <SiteVisitModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        notify("success", "Site visit submitted successfully");
                        fetchVisits();
                    }}
                />
            )}
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

const VisitCard = ({ visit, onAction }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 group hover:shadow-lg transition-all">
        <div className="w-24 h-24 rounded-xl overflow-hidden shadow-inner bg-slate-100">
            {visit.selfieImage && visit.selfieImage !== 'default.jpg' ? (
                <img src={`/uploads/${visit.selfieImage}`} alt="Selfie" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-4xl">person</span>
                </div>
            )}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
                <h4 className="text-xl font-black text-slate-900">{visit.customerName}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${visit.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    visit.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {visit.status}
                </span>
            </div>
            <p className="text-sm font-bold text-slate-500 mb-2">{visit.propertyName || "Property Listing"} • Distance: {visit.distance ? `${(visit.distance / 1000).toFixed(2)} km` : 'N/A'}</p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {new Date(visit.visitTime).toLocaleString()}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person_pin</span> Agent: {visit.employeeName || visit.agent?.name || "N/A"}</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {visit.status === 'Pending' && (
                <>
                    <button
                        onClick={() => onAction(visit._id, 'approve')}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => onAction(visit._id, 'reject')}
                        className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                    >
                        Reject
                    </button>
                </>
            )}
            <button
                onClick={() => onAction(visit._id, 'delete')}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
            >
                <span className="material-symbols-outlined">delete</span>
            </button>
        </div>
    </div>
);

const HistoryItem = ({ name, property, status, isNegative }) => (
    <div className="flex justify-between items-center">
        <div>
            <p className="text-sm font-black text-slate-900">{name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{property}</p>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isNegative ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
            {status}
        </span>
    </div>
);

export default SiteVisitVerification;
