package com.example.xyzmarket.util;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class HttpClientUtil {

    private RestTemplate restTemplate = new RestTemplate();
    public String code2Session(String appid, String secret, String code) {
        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session" + "?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                appid, secret, code
        );
        return restTemplate.getForObject(url, String.class);
    }

}