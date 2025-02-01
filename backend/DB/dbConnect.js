import mongoose from "mongoose";


const dbConnect = async()=>{
    try {
        console.log(process.env.MONGODB_CONNECT);
        await mongoose.connect(process.env.MONGODB_CONNECT),
        console.log("DB connected Succesfully");
    } catch (error) {
        console.log("failed");
    }
}
 

export default dbConnect