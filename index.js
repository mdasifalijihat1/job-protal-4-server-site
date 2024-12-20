const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// midleWare
app.use(cors());
app.use(express.json());

// mongodb all code

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vbi8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //  jobs related apis
    const jobsCollection = client.db("jobProtal").collection("jobs");
    const jobApplicationCollection = client
      .db("jobProtal")
      .collection("job-applications");

    // all jobs
    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // specific data load
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // job appliction apis
    // get all data , get one data, get some data [0, 1, many]
    app.get("/job-application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await jobApplicationCollection.find(query).toArray();

      // fokira way to aggregate data
      for(const application of result ){
        console.log(application.job_id) 
        const query1 = { _id: new ObjectId(application.job_id)}
        const job = await jobsCollection.findOne(query1);
        if(job){
            application.title = job.title;
            application.company = job.company;
            application.company_logo = job.company_logo;
            application.jobType = job.jobType;
            application.applicationDeadline = job.applicationDeadline;
            application.category = job.category;
            application.location = job.location;

        }
      }
      res.send(result);
    });

    // job appliction apis
    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//  live server listen
app.get("/", (req, res) => {
  res.send("job is falling from the sky");
});

app.listen(port, () => {
  console.log(`job is waiting at: ${port} `);
});
