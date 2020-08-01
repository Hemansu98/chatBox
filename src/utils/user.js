const users = [];

const addUser = ( { id, username, room } ) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase();
     
    // validate the data
    if(!username || !room) {
        return {
            error: 'Username and room must be provided!'
        }
    }

    // check the existing user with same name in that room
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    if(existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    const user = { id, username, room };
    users.push(user);

    return { user };
}   

const removeUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id;
    });
    
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => {
        return user.id === id;
    });
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();  
    return users.filter(user => {
        return user.room === room;
    }); 
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}