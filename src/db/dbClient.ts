import { connect } from "mongoose";

await connect(process.env.DATABASE_URL!, {
    retryWrites: true,
    readConcern: "majority"
});