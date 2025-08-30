import mongoose, { Document, Model, mongo, Schema } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";


const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    name:string;
    email:string;
    password: string;
    avatar:{
        public_id:string;
        url:string;
    },
    role:string;
    isVerified: boolean;
    loginMethod:string;
    comparePassword: (password:string) => Promise<boolean>
    SignAccessToken: () => string;
    SignRefreshToken: () => string;

}
export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    avatar:{
        public_id:string,
        url:string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{courseId:string}>;
    comparePassword: (password:string) => Promise<boolean>;

}

const userSchema : Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your name!"]
    },
    email: {
        type:String,
        required: [true, "Please enter your email!"],
        validate:{
            validator: function (value:string){
                return emailRegexPattern.test(value);
            },
            message:"Please enter a valid email",
        }, 
        unique:true,
    },
    password:{
        type:String, 
        minlength: [6,"Password must be at least 6 characters"],
        select:false,

    },
    avatar:{
        public_id: String,
        url:String,

    },
    role:{
        type: String,
        defaut : "user"
    },
    isVerified: {
        type:Boolean, 
        default: false,

    },
    loginMethod:{
        type:String, 
        default: "local"

    },

    courses:[
        {
            courseId:String,
        }
    ]


},{timestamps:true});

// Hash Password before saving, 

userSchema.pre<IUser>('save',async function (next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
})
// sign access token
userSchema.methods.SignAccessToken = function (){
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || '',{
        expiresIn:"5m",
    })
}

// sign access token
userSchema.methods.SignRefreshToken = function (){
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || '',{
        expiresIn:"3d",
    })
}
 

// compare password 
userSchema.methods.comparePassword = async function(enteredPassword:string): Promise<boolean>{
    return await bcrypt.compare(enteredPassword,this.password);
}
const userModel: Model<IUser> = mongoose.model("User",userSchema);
export default userModel