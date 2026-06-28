import React, { useState, useEffect } from 'react';
import api from '../../api';

const SiteVisitModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        propertyName: '',
        latitude: '',
        longitude: '',
        remarks: '',
    });
    const [selfie, setSelfie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [capturingLocation, setCapturingLocation] = useState(false);

    useEffect(() => {
        handleCaptureLocation();
    }, []);

    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setCapturingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setCapturingLocation(false);
            },
            (error) => {
                console.error("Error capturing location:", error);
                setCapturingLocation(false);
                alert("Failed to capture location. Please ensure GPS is enabled.");
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.latitude || !formData.longitude) {
            alert("GPS location is required. Please enable location services.");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('customerName', formData.customerName);
        data.append('propertyName', formData.propertyName);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        data.append('remarks', formData.remarks);
        if (selfie) {
            data.append('selfieImage', selfie);
        }

        try {
            await api.post('/sitevisits', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error submitting site visit:", err);
            alert(err.response?.data?.message || "Failed to submit site visit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-900">Submit Site Visit</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Property Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. Skyline Apartments"
                            value={formData.propertyName}
                            onChange={e => setFormData({ ...formData, propertyName: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude</label>
                            <input
                                type="text"
                                readOnly
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none"
                                value={formData.latitude || (capturingLocation ? 'Capturing...' : '')}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude</label>
                            <input
                                type="text"
                                readOnly
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none"
                                value={formData.longitude || (capturingLocation ? 'Capturing...' : '')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selfie Image</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                required
                                className="hidden"
                                id="selfie-upload"
                                onChange={e => setSelfie(e.target.files[0])}
                            />
                            <label
                                htmlFor="selfie-upload"
                                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-500"
                            >
                                {selfie ? (
                                    <span className="text-blue-600 font-bold">{selfie.name}</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">photo_camera</span>
                                        <span className="font-bold text-sm">Take / Upload Selfie</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none"
                            rows="3"
                            placeholder="Any additional notes..."
                            value={formData.remarks}
                            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || capturingLocation}
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>Submitting...</>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">send</span>
                                Submit Site Visit
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SiteVisitModal;
