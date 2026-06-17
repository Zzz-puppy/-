package com.example.xyzmarket.common;

public class ErrorCode {

    public static final int SUCCESS = 200;
    public static final int BAD_REQUEST = 400;
    public static final int UNAUTHORIZED = 401; // JWT拦截器硬编码
    public static final int FORBIDDEN = 403;
    public static final int NOT_FOUND = 404;
    public static final int SERVER_ERROR = 500;

    // 业务错误码
    public static final int USER_EXIST = 1001;
    public static final int USER_NOT_EXIST = 1002;
    public static final int PASSWORD_ERROR = 1003;

}