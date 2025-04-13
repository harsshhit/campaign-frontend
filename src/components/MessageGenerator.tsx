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
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { LinkedInProfile } from "../types";
import { messageApi } from "../services/api";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  currentPosition: z
    .string()
    .min(1, "Current position is required")
    .max(100, "Current position must be less than 100 characters"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company must be less than 100 characters"),
  industry: z
    .string()
    .min(1, "Industry is required")
    .max(50, "Industry must be less than 50 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(500, "Summary must be less than 500 characters"),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      description: z.string(),
    })
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      graduationYear: z.string(),
    })
  ),
  skills: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const sampleProfile: ProfileFormData = {
  firstName: "John",
  lastName: "Doe",
  currentPosition: "Senior Software Engineer",
  company: "Tech Corp",
  industry: "Technology",
  location: "San Francisco, CA",
  summary:
    "Experienced software engineer with a passion for building scalable applications.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      duration: "2020 - Present",
      description: "Leading development of core platform features.",
    },
  ],
  education: [
    {
      school: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      graduationYear: "2018",
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "TypeScript"],
};

interface MessageGeneratorProps {
  campaignId: string;
}

export const MessageGenerator: React.FC<MessageGeneratorProps> = ({
  campaignId,
}) => {
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: sampleProfile,
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageApi.generate(data, campaignId);
      setGeneratedMessage(response.data.message);
    } catch (error) {
      setError("Failed to generate message. Please try again.");
      console.error("Error generating message:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    reset(sampleProfile);
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
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
      >
        LinkedIn Message Generator
      </Typography>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Profile Information
            </Typography>
            <Button
              onClick={loadSampleData}
              variant="outlined"
              startIcon={<RefreshIcon />}
              size="small"
            >
              Load Sample
            </Button>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  {...register("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Current Position"
                  {...register("currentPosition")}
                  error={!!errors.currentPosition}
                  helperText={errors.currentPosition?.message}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Company"
                  {...register("company")}
                  error={!!errors.company}
                  helperText={errors.company?.message}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Industry"
                  {...register("industry")}
                  error={!!errors.industry}
                  helperText={errors.industry?.message}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Location"
                  {...register("location")}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Summary"
                  {...register("summary")}
                  error={!!errors.summary}
                  helperText={errors.summary?.message}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{
                mt: 2,
                borderRadius: 1,
                textTransform: "none",
                px: 2,
                minWidth: 150,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Generate Message"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="retry"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {generatedMessage && (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <CardContent>
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
                  }}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                color: "text.secondary",
              }}
            >
              {generatedMessage}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
