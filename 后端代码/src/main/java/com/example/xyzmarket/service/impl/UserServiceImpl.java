package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.common.ErrorCode;
import com.example.xyzmarket.config.WxConfig;
import com.example.xyzmarket.dto.UpdateProfileDTO;
import com.example.xyzmarket.dto.WxLoginDTO;
import com.example.xyzmarket.entity.Certification;
import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.exception.BusinessException;
import com.example.xyzmarket.mapper.CertificationMapper;
import com.example.xyzmarket.mapper.FavoriteMapper;
import com.example.xyzmarket.mapper.UserMapper;
import com.example.xyzmarket.service.UserService;
import com.example.xyzmarket.util.HttpClientUtil;
import com.example.xyzmarket.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.boot.json.JacksonJsonParser;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CertificationMapper certificationMapper;

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Autowired
    private HttpClientUtil httpClientUtil;

    @Autowired
    private WxConfig wxConfig;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public Map<String, Object> wxLogin(WxLoginDTO wxLoginDTO) {
        String code = wxLoginDTO.getCode();

        // 测试模式 / 真实模式
        String openid;
        if ("test_code".equals(code)) {
            openid = "test_openid_fixed_user_001";
        } else {
            String appid = wxConfig.getAppid();
            String secret = wxConfig.getSecret();
            String jsonString = httpClientUtil.code2Session(appid, secret, code);
            JacksonJsonParser parser = new JacksonJsonParser();
            Map<String, Object> map = parser.parseMap(jsonString);
            openid = (String) map.get("openid");
            if (openid == null) throw new BusinessException(ErrorCode.SERVER_ERROR, "微信登录失败");
        }

        User user = userMapper.findByOpenid(openid);
        if (user == null) {
            User newUser = new User();
            newUser.setOpenid(openid);
            newUser.setNickname("用户" + (System.currentTimeMillis() % 100000));
            newUser.setAvatarUrl("");
            newUser.setCreditScore(60);
            newUser.setCompletedDeals(0);
            newUser.setCancelledDeals(0);
            newUser.setRole("user");
            newUser.setCreateTime(LocalDateTime.now());
            newUser.setUpdateTime(LocalDateTime.now());

            userMapper.insert(newUser);
            user = newUser;
        }

        String token = jwtUtil.generateToken(user.getId());
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("token", token);
        result.put("role", user.getRole());
        return result;
    }

    @Override
    public Map<String, Object> adminLogin(String password) {
        Integer attempts = userMapper.getAdminLoginAttempts();
        if (attempts == null) attempts = 0;

        if (attempts >= 10) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "管理员入口已被锁定");
        }

        if (!adminPassword.equals(password)) {
            userMapper.incrementAdminLoginAttempts(LocalDateTime.now());
            int remaining = 9 - attempts;
            if (remaining <= 0) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "管理员入口已被锁定");
            }
            throw new BusinessException(ErrorCode.BAD_REQUEST, "密码错误，剩余" + remaining + "次机会");
        }

        userMapper.resetAdminLoginAttempts(LocalDateTime.now());

        User admin = userMapper.findByRole("admin");
        if (admin == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "管理员账户不存在，请联系系统管理员");
        }

        String token = jwtUtil.generateToken(admin.getId());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("role", admin.getRole());
        result.put("nickname", admin.getNickname());
        return result;
    }

    @Override
    public boolean isAdminLocked() {
        Integer attempts = userMapper.getAdminLoginAttempts();
        return attempts != null && attempts >= 10;
    }

    @Override
    public Map<String, Object> switchToAdmin(Long userId, String password) {
        if (!adminPassword.equals(password)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "管理员密码错误");
        }

        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }

        if ("admin".equals(user.getRole())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "当前已是管理员");
        }

        userMapper.updateRole(userId, "admin");

        String token = jwtUtil.generateToken(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("role", "admin");
        return result;
    }

    @Override
    public User getUserByOpenid(String openid) {
        return userMapper.findByOpenid(openid);
    }

    @Override
    public User getUserById(Long id) {
        User user = userMapper.findById(id);
        if (user == null) throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        return user;
    }

    @Override
    public void certify(Long userId, String studentId, String email) {
        User user = userMapper.findById(userId);
        if (user == null) throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        if ("admin".equals(user.getRole())) {
            Certification cert = new Certification();
            cert.setUserId(userId);
            cert.setStudentId(studentId);
            cert.setEmail(email);
            cert.setStatus("approved");
            cert.setReviewerId(userId);
            cert.setCreateTime(LocalDateTime.now());
            cert.setReviewTime(LocalDateTime.now());
            certificationMapper.insert(cert);
            userMapper.certify(userId, studentId, LocalDateTime.now());
            return;
        }
        if (Boolean.TRUE.equals(user.getIsCertified())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "已认证，无需重复认证");
        }

        Certification existing = certificationMapper.findByUserId(userId);
        if (existing != null && "pending".equals(existing.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "已有待审核的认证申请，请耐心等待");
        }

        Certification certification = new Certification();
        certification.setUserId(userId);
        certification.setStudentId(studentId);
        certification.setEmail(email);
        certification.setStatus("pending");
        certification.setCreateTime(LocalDateTime.now());
        certificationMapper.insert(certification);
    }

    @Override
    public User updateProfile(Long userId, UpdateProfileDTO dto) {
        User user = userMapper.findById(userId);
        if (user == null) throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");

        String nickname = dto.getNickname();
        String avatarUrl = dto.getAvatarUrl();
        String grade = dto.getGrade();

        if (nickname == null) nickname = user.getNickname();
        if (avatarUrl == null) avatarUrl = user.getAvatarUrl();
        if (grade == null) grade = user.getGrade();

        userMapper.updateProfile(userId, nickname, avatarUrl, grade, LocalDateTime.now());
        return userMapper.findById(userId);
    }

    @Override
    public List<User> getAllUsers() {
        return userMapper.listAll();
    }

}