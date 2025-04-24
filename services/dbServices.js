// imports

const {Pool} = require('pg');
const { connect_timeout, idleTimeoutMillis } = require('pg/lib/defaults');

// Set up connection to DB and CRUD ops

// local development uncomment below
// const pool = new Pool({
//    user: process.env.DB_USER,
//    host: process.env.DB_HOST,
//    database: process.env.DB_DATABASE,
//    password: process.env.DB_PASSWORD,
//    port: process.env.DB_PORT,
//  });


//   hosted on heroku for my hosted version only

const getLastTrialId = 
async () => {
    const client = await pool.connect();
    try {
        const query = "SELECT MAX(trial_id) AS max_id FROM trials;"
        const result = await client.query(query);
        const maxId = result.rows[0].max_id ? result.rows[0].max_id : 1;
        return maxId;
    } finally {
        client.release();
    }

}

 const dns = require('dns');

 Force Node.js to prioritize IPv4 over IPv6
 dns.setDefaultResultOrder('ipv4first');

  const pool = new Pool({
     connectionString: process.env.SUPABASE_DB_URL,
      ssl:{
          rejectUnauthorized: false
      },
      connect_timeout: 5,
      idleTimeoutMillis: 30000
  });
  
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error("Connection error", err.stack));


const insertParticipant = async (username, condition, groupName, censoredInfo, gender, age) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO participants (condition, group_name, censorship_group, experiment_start_time, gender, age) VALUES ($1, $2, $3, $4, $5, $6) RETURNING participant_id;';
        const time = new Date().toISOString();
        const values = [condition, groupName, censoredInfo, time, gender, age];
        console.log(values);
        const result = await client.query(query, values);
    } finally {
        client.release();
    }

};

const getNextId = async () => {
    console.log("attempting connection")
    const client = await pool.connect();
    try {
        console.log("connected")
        const query = 'SELECT MAX(participant_id) AS max_id FROM participants;'
        const result = await client.query(query);
        console.log("query sent and result returned")
        const maxId = result.rows[0].max_id;
        console.log(`maxId is equal to ${maxId !== null ? maxId : 1} because maxId is real : ${maxId !== null}`)
        return maxId !== null ? Number(maxId) + 1 : 1;
    } finally {
        client.release();
    }

};

const insertTrial = async (participant, type, number, start, end, url) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO trials (participant_id, trial_type, trial_number, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING trial_id;';
        const values = [participant, type, number, start, end];
        const result = await client.query(query, values);
        return result.rows[0].trial_id;
    } finally {
        client.release();
    }
};

const insertPacket = async (trial, user, advisor, accepted, time) => {
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO packets (trial_id, user_input, advisor_recommendation, accepted, classified_time) VALUES ($1, $2, $3, $4, $5);';
        const values = [trial, user, advisor, accepted, time];
        const result = await client.query(query, values);
        // return result.rows[0].trial_id;
    } catch (err) {
        console.error("couldnt add packet input", err.stack); 
    } finally {
        client.release();
    }
};



const insertScale = async (participant, type, phase) => {
   
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO scales (participant_id, scale_type, scale_phase) VALUES ($1, $2, $3) RETURNING scale_id;';
        const values = [participant, type, phase];
        const result = await client.query(query, values);
        return result.rows[0].scale_id;
    } finally {
        client.release();
    }
};

const insertItem = async (itemNumber, scale, value) => {
 
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO items (item_id, scale_id, item_value) VALUES ($1, $2, $3);';
        const values = [itemNumber, scale, value];
        const result = await client.query(query, values);
    } finally {
        client.release();
    }
};

const insertFeedback = async (participant, feedback) => {
    const client = await pool.connect();
    try {
        const query = 'UPDATE participants SET feedback = $2 WHERE participant_id = $1;';
        const values = [participant, feedback];
        const result = await client.query(query, values);
    } finally {
        client.release();
    }
};

const insertCursorData = async (dataObject, trialId) => {
    const client = await pool.connect();
    console.log("in to mouse data insert")
    try {
        let {x, y, time, event} = dataObject
        console.log(typeof time);
        const query = 'INSERT INTO cursor_data (x, y, time, event, trial_id) VALUES ($1, $2, $3, $4, $5);';
        const values = [x,y,time,event, trialId];
        const result = await client.query(query, values);
    } finally {
        console.log("mouse data insert finished")
        client.release();
    }
}

const dbServices = {
    insertFeedback,

    insertItem,

    insertScale,

    insertPacket,

    insertTrial,

    insertParticipant,

    getNextId,

    getLastTrialId,
    
    insertCursorData

};


module.exports =   dbServices;