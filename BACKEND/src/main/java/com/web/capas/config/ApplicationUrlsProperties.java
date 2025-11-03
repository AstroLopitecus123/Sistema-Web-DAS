package com.web.capas.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.url")
public class ApplicationUrlsProperties {

    private String frontend;
    private String backend;
    private List<String> corsAllowed = new ArrayList<>();

    public String getFrontend() {
        return frontend;
    }

    public void setFrontend(String frontend) {
        this.frontend = frontend;
    }

    public String getBackend() {
        return backend;
    }

    public void setBackend(String backend) {
        this.backend = backend;
    }

    public List<String> getCorsAllowed() {
        return corsAllowed;
    }

    public void setCorsAllowed(List<String> corsAllowed) {
        this.corsAllowed = corsAllowed;
    }
}

