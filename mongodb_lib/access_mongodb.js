const conn = require('./connection/connection');
const User = require('./schema/User');
const Sleep = require('./schema/Sleep');
const LocalDate = require('../date_lib/get_local_date');

async function internalSelectUserObjId (userId){
    var user;
    try{
        user = await User.findOne({userId : userId});
        if(user == null){
            return null;
        }else{
            return user._id;
        }
    }catch(err){
        throw err;
    }
}

const exportingModule = {
    // selectUserObjId : async (userId) => {
    //     await conn.connect('getObjId');
    //     try{
    //         var user = await User.findOne({userId : userId});
    //         if(user == null){
    //             console.log('no such user');
    //             return null;
    //         }else{
    //             return user._id;
    //         }
    //     }catch(err){
    //         console.log('err at getObjId');
    //         console.log(err);
    //     }finally{
    //         await conn.disconnect('getObjId');
    //     }
    // },
    //deprecated external selectUserObjId

    /**
     * 
     * @param {*} userId 
     * @returns no such user or fail : null / success : user pullDate Obj
     */
    selectUserPullDate : async (userId) => {
        await conn.connect('selectPullDate');
        try{
            var user = await User.findOne({ userId : userId});
            if(user == null){
                console.log('no such user');
                return null;
            }else{
                return user.pullDate;
            }
        }catch(err){
            console.log('err at selectUserPullDate');
            console.log(err);
        }finally{
            await conn.disconnect('selectPullDate');
        }
    },
    /**
     * if user document with userId not exists -> insert User document with userId, now date obj
     * if user document with userId exists -> update user document with now date obj
     * @param {*} userId 
     * @returns fail : false / success : true
     */
    upsertUserPullDateNow : async (userId) => {
        await conn.connect('updateLastDateNow');
        try{
            var now = LocalDate.now();
            var doc = await User.findOneAndUpdate({userId : userId}, {userId : userId, pullDate : now}, {upsert : true});
            if(doc == null){
                console.log('function err at Mongoose findOneAndUpdate')
                return false;
            }else{
                return true;
            }
        }catch(err){
            console.log('err at updateUserLastDateNow');
            console.log(err);
        }finally{
            await conn.disconnect('updateLastDateNow');
        }
    },
    /**
     * 
     * @param {*} userId 
     * @param {*} sleepDataList 
     * @returns no such user or fail : false / success : true
     */
    insertUserSleepDataList : async (userId, sleepDataList) => {
        await conn.connect('insertSleepData');
        try{
            var userObjId = await internalSelectUserObjId(userId);
            if(userObjId == null){
                console.log('no such user');
                return false;
            }
            var sleepDataSchemaList = [];
            for(const sleepData of sleepDataList){
                var date = LocalDate.byFormat2(sleepData.endTime);
                sleepDataSchemaList.push({userObjId : userObjId, date : date, sleepData : sleepData});
            }
            const docs = await Sleep.insertMany(sleepDataSchemaList);
            if(docs == null){
                console.log('function err at Mongoose insertMany')
                return false;
            }else{
                return true;
            }
        }catch(err){
            console.log('err at insertUserSleepData');
            console.log(err);
        }finally{
            await conn.disconnect('inserSleepData');
        }
    }
};

module.exports = exportingModule;