package com.javaschoollab.web;

import java.io.IOException;
import java.time.Duration;
import java.util.regex.Pattern;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the built React site (classpath:/static, filled by the with-site Maven profile).
 *
 * React Router routes such as /course/java/basics/Constructor_in_java don't exist as files, so a refresh or a
 * shared link would 404. Any path that is not an API call and has no file extension therefore gets index.html
 * and the browser router takes over. A missing real file (a .js, .png...) is still a proper 404.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    private static final Pattern HAS_EXTENSION = Pattern.compile(".*\\.[A-Za-z0-9]{1,8}$");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Vite names these files by content hash, so they can be cached for good.
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());

        // Course images are named by content hash too (written by npm run export:content).
        registry.addResourceHandler("/content-assets/**")
                .addResourceLocations("classpath:/static/content-assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());

        // Everything else (index.html, sw.js, manifest, icons) must be re-checked, or a new deploy would not show up.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new SpaFallbackResolver());
    }

    static final class SpaFallbackResolver extends PathResourceResolver {
        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            Resource requested = location.createRelative(resourcePath);
            if (requested.exists() && requested.isReadable()) return requested;
            if (resourcePath.startsWith("api/") || HAS_EXTENSION.matcher(resourcePath).matches()) return null;
            Resource index = location.createRelative("index.html");
            return index.exists() && index.isReadable() ? index : null;
        }
    }
}
