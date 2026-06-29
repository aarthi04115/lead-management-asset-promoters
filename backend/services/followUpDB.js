const FollowUp = require('../models/FollowUp');
const mongoose = require('mongoose');

// Use Asia/Kolkata timezone for all calculations
const getKolkataNow = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

const followUpDateTime = (followUp) => {
    if (followUp.followUpDate) {
        const dateStr = followUp.followUpDate;
        const timeStr = followUp.followUpTime || '00:00';
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, 0);
    } else if (followUp.schedule) {
        return new Date(followUp.schedule);
    } else if (followUp.scheduledAt) {
        return new Date(followUp.scheduledAt);
    } else if (followUp.createdAt) {
        return new Date(followUp.createdAt);
    } else {
        return new Date();
    }
};

const isOverdue = (followUp) => {
    if (followUp.status === 'Completed') return false;
    const now = getKolkataNow();
    const fuDateTime = followUpDateTime(followUp);
    return fuDateTime < now;
};

const getKolkataToday = () => {
    const now = getKolkataNow();
    return now.toISOString().slice(0, 10);
};

const getKolkataTime = () => {
    const now = getKolkataNow();
    return now.toTimeString().slice(0, 5);
};

const syncOverdueStatuses = async () => {
    const allPendingOrOverdue = await FollowUp.find({ status: { $in: ['Pending', 'Overdue'] } });
    let updatedCount = 0;
    for (const f of allPendingOrOverdue) {
        const overdue = isOverdue(f);
        if (f.status === 'Pending' && overdue) {
            f.status = 'Overdue';
            await f.save();
            updatedCount++;
        } else if (f.status === 'Overdue' && !overdue) {
            f.status = 'Pending';
            await f.save();
            updatedCount++;
        }
    }
    return updatedCount;
};

const getAllFollowUps = async (baseQuery = {}) => {
    await syncOverdueStatuses();
    const followUps = await FollowUp.find(baseQuery);
    return followUps.sort((a, b) => {
        const da = followUpDateTime(a);
        const db = followUpDateTime(b);
        return da - db;
    });
};

const getFollowUpById = async (id) => {
    let doc = await FollowUp.findById(id);
    if (!doc && mongoose.isValidObjectId(id)) {
        const rawDoc = await FollowUp.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (rawDoc) return new FollowUp(rawDoc, true);
    }
    return doc;
};

const getLatestByCustomer = async (customerName, baseQuery = {}) => {
    const customerFollowUps = await FollowUp.find({ customerName, ...baseQuery });
    if (customerFollowUps.length === 0) return null;
    customerFollowUps.sort((a, b) => {
        const da = followUpDateTime(a);
        const db = followUpDateTime(b);
        return db - da;
    });
    return customerFollowUps[0];
};

const createFollowUp = async (payload) => {
    const newFollowUp = new FollowUp(payload);
    return newFollowUp.save();
};

const updateFollowUp = async (id, payload) => {
    let updated = await FollowUp.findByIdAndUpdate(id, payload, { new: true });
    if (!updated && mongoose.isValidObjectId(id)) {
        await FollowUp.collection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: payload });
        const rawDoc = await FollowUp.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (rawDoc) updated = new FollowUp(rawDoc, true);
    }
    return updated;
};

const deleteFollowUp = async (id) => {
    let deleted = await FollowUp.findByIdAndDelete(id);
    if (!deleted && mongoose.isValidObjectId(id)) {
        const rawDoc = await FollowUp.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (rawDoc) {
            await FollowUp.collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
            deleted = new FollowUp(rawDoc, true);
        }
    }
    return deleted;
};

const getUpcomingReminders = async (baseQuery = {}) => {
    const today = getKolkataToday();
    const currentTime = getKolkataTime();

    const followUps = await FollowUp.find({ status: { $ne: 'Completed' }, ...baseQuery });
    return followUps
        .filter((f) =>
            f.followUpDate > today ||
            (f.followUpDate === today && f.followUpTime > currentTime)
        )
        .sort((a, b) => {
            const da = followUpDateTime(a);
            const db = followUpDateTime(b);
            return da - db;
        });
};

const getStats = async (baseQuery = {}) => {
    await syncOverdueStatuses();
    const today = getKolkataToday();

    const followUps = await FollowUp.find(baseQuery);
    const count = (fn) => followUps.filter(fn).length;

    return {
        todaysFollowUps: count((f) => f.followUpDate === today),
        pending: count((f) => f.status === 'Pending' && !isOverdue(f)),
        completed: count((f) => f.status === 'Completed'),
        overdue: count((f) => f.status === 'Overdue' || (f.status === 'Pending' && isOverdue(f))),
        upcomingReminders: count((f) => f.status === 'Pending' && !isOverdue(f))
    };
};

const getNextFollowUp = async (baseQuery = {}) => {
    const today = getKolkataToday();
    const currentTime = getKolkataTime();

    const followUps = await FollowUp.find({ status: { $ne: 'Completed' }, ...baseQuery });
    const upcoming = followUps
        .filter((f) =>
            f.followUpDate > today ||
            (f.followUpDate === today && f.followUpTime > currentTime)
        )
        .sort((a, b) => {
            const da = followUpDateTime(a);
            const db = followUpDateTime(b);
            return da - db;
        });

    return upcoming.length > 0 ? upcoming[0] : null;
};

const getReminders = async (baseQuery = {}) => {
    const now = getKolkataNow();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    const allFollowUps = await getAllFollowUps(baseQuery);

    const reminders = allFollowUps
        .filter(f => f.status !== 'Completed')
        .filter(f => {
            if (!f.followUpDate || !f.followUpTime) return false;
            const followUpDateTimeVal = new Date(`${f.followUpDate}T${f.followUpTime}`);
            return followUpDateTimeVal >= now && followUpDateTimeVal <= tenMinutesFromNow;
        })
        .sort((a, b) => {
            const da = followUpDateTime(a);
            const db = followUpDateTime(b);
            return da - db;
        });

    return reminders;
};

const filterFollowUps = async (filters, baseQuery = {}) => {
    const query = { ...baseQuery };
    if (filters.status && filters.status !== 'All') {
        query.status = filters.status;
    }
    if (filters.priority && filters.priority !== 'All') {
        query.priority = filters.priority;
    }

    if (filters.search) {
        query.$or = [
            { customerName: { $regex: filters.search, $options: 'i' } },
            { notes: { $regex: filters.search, $options: 'i' } },
            { status: { $regex: filters.search, $options: 'i' } },
            { priority: { $regex: filters.search, $options: 'i' } }
        ];
    }

    const today = getKolkataToday();

    if (filters.timeFilter === 'Today') {
        query.followUpDate = today;
    } else if (filters.timeFilter === 'Upcoming') {
        const currentTime = getKolkataTime();
        query.$or = [
            { followUpDate: { $gt: today } },
            { followUpDate: today, followUpTime: { $gt: currentTime } }
        ];
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalRecords = await FollowUp.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const pipeline = [
        { $match: query },
        {
            $addFields: {
                isPast: {
                    $cond: { if: { $lt: ["$followUpDate", today] }, then: 1, else: 0 }
                }
            }
        },
        { $sort: { isPast: 1, followUpDate: 1, followUpTime: 1 } },
        { $skip: skip },
        { $limit: limit }
    ];

    const followUpsRaw = await FollowUp.aggregate(pipeline);
    const followUps = followUpsRaw.map(doc => new FollowUp(doc, true));

    return {
        data: followUps,
        currentPage: page,
        totalPages,
        totalRecords,
        recordsPerPage: limit
    };
};

const connect = async () => {
    return;
};

const isConnected = () => true;

module.exports = {
    connect,
    isConnected,
    getAllFollowUps,
    getFollowUpById,
    getLatestByCustomer,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    getUpcomingReminders,
    getStats,
    getNextFollowUp,
    getReminders,
    filterFollowUps,
    getKolkataNow,
    getKolkataToday,
    getKolkataTime,
    isOverdue
};
