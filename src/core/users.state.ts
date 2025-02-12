import { getProfilesByUUID } from "./backend/services/firestore.service";

// /Myabe can also save in session storage?
let chatUsers: any = {};

const buildUsersList = async (uuids: Array<string>) => {
    // Use Set to get unique values
    const current_uuids = Object.keys(chatUsers);
    const uniqueValues = [...new Set(uuids)].filter(item => !current_uuids.includes(item));;

    const new_users = await getProfilesByUUID(uniqueValues);
    chatUsers = {...chatUsers, ...new_users};
}

export {buildUsersList, chatUsers};