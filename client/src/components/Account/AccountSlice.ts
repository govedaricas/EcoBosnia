import { FieldValues } from "react-hook-form";
import agent from "../../api/agent";
import { User } from "../../app/models/User";
import {createAsyncThunk, createSlice, isAnyOf} from '@reduxjs/toolkit';
import { router } from "../../Router/Router";
import { useNavigate } from "react-router-dom";

interface AccountState{
    user:User | null;

}
const initialState:AccountState={
    user:null
}
export const signInUser=createAsyncThunk<User,FieldValues>(
    'account/signIn',
    async(data,thunkAPI)=>{
        try {
            const user=await agent.Account.login(data);
            localStorage.setItem('user',JSON.stringify(user));
            return user;
        } catch (error:any) {
            //throw error;
            return thunkAPI.rejectWithValue({error:error.data})
        }
    }
)

export const fetchCurrentUser=createAsyncThunk<User>(
    '/fetchCurrentUser',
    async(_,thunkAPI)=>{
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)));
        try {
            const user=await agent.Account.currentUser();
            console.log("CURRENT",user.username);
            localStorage.setItem('user',JSON.stringify(user));
            return user;
        } catch (error:any) {
            return thunkAPI.rejectWithValue({error:error.data})
        }
    },
    {
        condition:()=>{
            if(!localStorage.getItem('user')) return false;

        }
    }
)

export const AccountSlice=createSlice({
    name:'account',
    initialState,
    reducers: {
        signOut:(state)=>{
            state.user=null;
            localStorage.removeItem('user');
            router.navigate('/home');
        },
        setUser:(state,action)=>{
            state.user=action.payload;
            console.log(action.payload);
        }
    },
    extraReducers:(builder=>{
        builder.addCase(fetchCurrentUser.rejected,(state)=>{
            state.user=null;
            localStorage.removeItem('user');
            console.log('Session expired-please login again');
            router.navigate('/home');
        })
        builder.addMatcher(isAnyOf(signInUser.fulfilled,fetchCurrentUser.fulfilled),(state,action)=>{
            state.user=action.payload;
        });
        builder.addMatcher(isAnyOf(signInUser.rejected),(state,action)=>{
            console.log(action.payload);
        })
    })
})

export const {signOut,setUser}=AccountSlice.actions;