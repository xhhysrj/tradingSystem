package com.textbook.controller;

import com.textbook.dto.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 文件上传控制器
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${upload.path}")
    private String uploadPath;

    /**
     * 上传图片
     */
    @PostMapping("/image")
    public Result<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择文件");
        }

        // 检查文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isImageFile(originalFilename)) {
            return Result.error("只支持上传图片文件");
        }

        // 检查文件大小（最大 5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            return Result.error("文件大小不能超过 5MB");
        }

        try {
            // 生成唯一文件名
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;

            // 获取项目根目录的绝对路径
            String projectPath = System.getProperty("user.dir");
            Path uploadDir = Paths.get(projectPath, uploadPath);

            // 创建上传目录（如果不存在）
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // 保存文件
            Path destPath = uploadDir.resolve(filename);
            file.transferTo(destPath.toFile());

            // 返回文件访问路径
            String fileUrl = "/uploads/" + filename;

            Map<String, String> data = new HashMap<>();
            data.put("url", fileUrl);
            data.put("filename", filename);

            return Result.success("上传成功", data);

        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败：" + e.getMessage());
        }
    }

    /**
     * 检查是否为图片文件
     */
    private boolean isImageFile(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals(".jpg") || extension.equals(".jpeg") ||
               extension.equals(".png") || extension.equals(".gif") ||
               extension.equals(".bmp") || extension.equals(".webp");
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex);
        }
        return "";
    }
}
