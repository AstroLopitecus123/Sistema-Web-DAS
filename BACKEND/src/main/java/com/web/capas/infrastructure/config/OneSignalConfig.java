package com.web.capas.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OneSignalConfig {
    
    @Value("${onesignal.app.id}")
    private String appId;
    
    @Value("${onesignal.rest.api.key}")
    private String restApiKey;
    
    public String getAppId() {
        return appId;
    }
    
    public String getRestApiKey() {
        return restApiKey;
    }
}

