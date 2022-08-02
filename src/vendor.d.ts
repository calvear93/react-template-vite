/* eslint-disable @typescript-eslint/no-unused-vars */
import { Action } from 'redux';

declare module 'redux' {
    // fixes @reduxjs/toolkit async thunk compatibility
    interface Action<T = any> {
        type?: T;
    }
}
