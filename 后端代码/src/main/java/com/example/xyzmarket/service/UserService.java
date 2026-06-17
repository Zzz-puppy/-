package com.example.xyzmarket.service;

import com.example.xyzmarket.dto.UpdateProfileDTO;
import com.example.xyzmarket.dto.WxLoginDTO;
import com.example.xyzmarket.entity.User;

import java.util.List;
import java.util.Map;

public interface UserService {

    /**
     * 一键登录（仅需微信 code）
     * @param wxLoginDTO 包含微信 code
     * @return {userId, token, role}
     */
    Map<String, Object> wxLogin(WxLoginDTO wxLoginDTO);

    /**
     * 根据 openid 查询用户
     */
    User getUserByOpenid(String openid);

    /**
     * 根据用户ID查询用户
     */
    User getUserById(Long id);

    /**
     * 提交校园认证
     */
    void certify(Long userId, String studentId, String email);

    /**
     * 更新用户资料
     */
    User updateProfile(Long userId, UpdateProfileDTO dto);

    /**
     * 查询所有用户
     */
    List<User> getAllUsers();

    /**
     * 管理员密码验证，切换当前用户为管理员
     * @param userId 当前用户ID
     * @param password 管理员密码
     * @return {token, role} 新 token 和角色
     */
    Map<String, Object> switchToAdmin(Long userId, String password);

    /**
     * 管理员独立登录（使用预置管理员账户）
     * @param password 管理员密码
     * @return {token, role, nickname}
     */
    Map<String, Object> adminLogin(String password);

    /**
     * 检查管理员是否被锁定
     * @return true 表示已锁定
     */
    boolean isAdminLocked();

}