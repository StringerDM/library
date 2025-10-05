package ru.synergy.libraryapp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@Slf4j
public class HttpLoggingFilter extends OncePerRequestFilter {
    private static final int MAX_PAYLOAD_LENGTH = 2000;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        ContentCachingRequestWrapper requestWrapper = request instanceof ContentCachingRequestWrapper
                ? (ContentCachingRequestWrapper) request
                : new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = response instanceof ContentCachingResponseWrapper
                ? (ContentCachingResponseWrapper) response
                : new ContentCachingResponseWrapper(response);

        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - start;
            String principal = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                    .map(Authentication::getName)
                    .orElse("anonymous");
            String requestBody = getContentAsString(requestWrapper.getContentAsByteArray(), requestWrapper.getCharacterEncoding());
            String responseBody = getContentAsString(responseWrapper.getContentAsByteArray(), responseWrapper.getCharacterEncoding());

            log.info("HTTP {} {} status={} duration={}ms principal={} ip={} requestBody={} responseBody={}",
                    requestWrapper.getMethod(),
                    requestWrapper.getRequestURI(),
                    responseWrapper.getStatus(),
                    duration,
                    principal,
                    requestWrapper.getRemoteAddr(),
                    requestBody,
                    responseBody);

            responseWrapper.copyBodyToResponse();
        }
    }

    private String getContentAsString(byte[] buf, String encoding) {
        if (buf == null || buf.length == 0) {
            return "";
        }
        int length = Math.min(buf.length, MAX_PAYLOAD_LENGTH);
        Charset charset;
        if (encoding != null) {
            try {
                charset = Charset.forName(encoding);
            } catch (Exception ex) {
                charset = StandardCharsets.UTF_8;
            }
        } else {
            charset = StandardCharsets.UTF_8;
        }
        return new String(buf, 0, length, charset).replaceAll("\s+", " ").trim();
    }
}
