import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { messageApi } from "../services/api";

// Form validation schema
const messageFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  job_title: z
    .string()
    .min(1, "Job title is required")
    .max(100, "Job title is too long"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company is too long"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location is too long"),
  summary: z.string().max(500, "Summary must be less than 500 characters"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export const MessageGenerator = () => {
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      name: "",
      job_title: "",
      company: "",
      location: "",
      summary: "",
    },
  });

  const onSubmit = async (data: MessageFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageApi.generate(data);
      setGeneratedMessage(response.data.message);
    } catch (error: any) {
      console.error("Message generation error:", error);
      if (error.status === 404) {
        setError(
          "Server endpoint not found. Please ensure the backend server is running on the correct port."
        );
      } else if (error.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to generate message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          background:
            "linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #6d28d9, #10b981)",
            zIndex: 1,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Message Generator
        </Typography>
        <Typography color="text.secondary">
          Generate personalized LinkedIn outreach messages using AI
        </Typography>
      </Box>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: "blur(10px)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { sm: "1fr 1fr" },
            }}
          >
            <TextField
              label="Name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              sx={{ gridColumn: { xs: "1/-1", sm: "auto" } }}
            />
            <TextField
              label="Job Title"
              {...register("job_title")}
              error={!!errors.job_title}
              helperText={errors.job_title?.message}
              fullWidth
              sx={{ gridColumn: { xs: "1/-1", sm: "auto" } }}
            />
            <TextField
              label="Company"
              {...register("company")}
              error={!!errors.company}
              helperText={errors.company?.message}
              fullWidth
              sx={{ gridColumn: { xs: "1/-1", sm: "auto" } }}
            />
            <TextField
              label="Location"
              {...register("location")}
              error={!!errors.location}
              helperText={errors.location?.message}
              fullWidth
              sx={{ gridColumn: { xs: "1/-1", sm: "auto" } }}
            />
            <TextField
              label="Summary (Optional)"
              {...register("summary")}
              error={!!errors.summary}
              helperText={errors.summary?.message}
              multiline
              rows={4}
              fullWidth
              sx={{ gridColumn: "1/-1" }}
            />
          </Box>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <SendIcon />
              }
              sx={{
                py: 1.5,
                px: 4,
                background: "linear-gradient(45deg, #6d28d9, #8b5cf6)",
              }}
            >
              {loading ? "Generating..." : "Generate Message"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                reset();
                setGeneratedMessage("");
                setError(null);
              }}
              sx={{ py: 1.5, px: 4 }}
            >
              Clear
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Generated Message */}
      {generatedMessage && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            background: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Generated Message
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton
                onClick={copyToClipboard}
                size="small"
                sx={{
                  color: copied ? "success.main" : "primary.main",
                  transition: "all 0.2s",
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            {generatedMessage}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
