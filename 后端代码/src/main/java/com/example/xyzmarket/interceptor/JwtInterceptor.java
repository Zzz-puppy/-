package com.example.xyzmarket.interceptor;

import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.mapper.UserMapper;
import com.example.xyzmarket.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        if (uri.startsWith("/api/user/wxLogin")
                || uri.equals("/api/item/search")
                || uri.equals("/api/item/list")
                || uri.equals("/api/wanted/list")
                || ("GET".equalsIgnoreCase(method) && uri.matches("/api/item/[^/]+") && !uri.equals("/api/item/my"))) return true;

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"用户未登录\"}");
            return false;
        }

        String token = header.substring(7);
        if (!jwtUtil.validateToken(token)) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"token无效或已过期\"}");
            return false;
        }
        Long userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);

        if (uri.startsWith("/api/admin/")) {
            User user = userMapper.findById(userId);
            if (user == null || !"admin".equals(user.getRole())) {
                response.setStatus(403);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":403,\"message\":\"权限不足，需要管理员权限\"}");
                return false;
            }
        }

        return true;
    }

}