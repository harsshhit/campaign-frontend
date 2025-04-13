import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  OutlinedInput,
  alpha,
  Slide,
  Fade,
  useTheme,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Link as LinkIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  LinkedIn as LinkedInIcon,
  AccountCircle as AccountCircleIcon
} from "@mui/icons-material";
import { Campaign } from "../types";
import { campaignApi } from "../services/api";

const campaignSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  status: z.enum(["active", "inactive", "deleted"]),
  leads: z
    .array(
      z
        .string()
        .url("Must be a valid URL")
        .regex(
          /^https:\/\/(www\.)?linkedin\.com\/.*$/,
          "Must be a LinkedIn URL"
        )
    )
    .min(1, "At least one lead is required"),
  accounts: z.array(z.string()).min(1, "At least one account is required"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  initialData?: Campaign;
}

interface Account {
  _id: string;
  name: string;
}

const DUMMY_ACCOUNTS = [
  { _id: "507f1f77bcf86cd799439011", name: "Sales Account 1" },
  { _id: "507f1f77bcf86cd799439012", name: "Marketing Account 1" },
  { _id: "507f1f77bcf86cd799439013", name: "Support Account 1" },
  { _id: "507f1f77bcf86cd799439014", name: "Development Account 1" },
];

export const CampaignForm: React.FC<CampaignFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const theme = useTheme();
  const [newLead, setNewLead] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accounts] = useState<Account[]>(DUMMY_ACCOUNTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "inactive",
      leads: initialData?.leads || [],
      accounts: initialData?.accounts || [],
    },
  });

  const selectedAccounts = watch("accounts");
  const leads = watch("leads");

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        status: initialData?.status || "inactive",
        leads: initialData?.leads || [],
        accounts: initialData?.accounts || [],
      });
      setNewLead("");
      setError(null);
      setSuccess(null);
    }
  }, [open, initialData, reset]);

  const handleAddLead = () => {
    if (newLead) {
      setValue("leads", [...leads, newLead]);
      setNewLead("");
    }
  };

  const handleRemoveLead = (index: number) => {
    setValue(
      "leads",
      leads.filter((_, i) => i !== index)
    );
  };

  const handleFormSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure leads array has at least one item
      if (!data.leads || data.leads.length === 0) {
        setError("At least one lead is required");
        setIsSubmitting(false);
        return;
      }

      // Ensure accounts array has at least one item
      if (!data.accounts || data.accounts.length === 0) {
        setError("At least one account is required");
        setIsSubmitting(false);
        return;
      }

      // Validate LinkedIn URLs
      const invalidLead = data.leads.find(
        (lead) => !/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(lead)
      );
      if (invalidLead) {
        setError(`Invalid LinkedIn URL: ${invalidLead}`);
        setIsSubmitting(false);
        return;
      }

      const formData = {
        name: data.name.trim(),
        description: data.description.trim(),
        status: data.status || "inactive",
        leads: data.leads.map((lead) => lead.trim()),
        accounts: data.accounts,
      };

      await onSubmit(formData);
      setSuccess("Campaign saved successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
      PaperProps={{
        sx: {
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.2),
          overflow: "hidden",
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
        },
      }}
    >
      <DialogTitle
        sx={{ 
          borderBottom: "1px solid", 
          borderColor: alpha(theme.palette.primary.main, 0.1),
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Typography 
          variant="h5" 
          component="div"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {initialData ? "Edit Campaign" : "Create New Campaign"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Fade in={!!error}>
          <Box sx={{ mb: 2 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                }}
              >
                {error}
              </Alert>
            )}
          </Box>
        </Fade>
        <Fade in={!!success}>
          <Box sx={{ mb: 2 }}>
            {success && (
              <Alert 
                severity="success"
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                {success}
              </Alert>
            )}
          </Box>
        </Fade>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          <Box 
            sx={{ 
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: theme.palette.primary.light
              }}
            >
              Campaign Details
            </Typography>
            
            <TextField
              label="Campaign Name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                }
              }}
            />
            
            <TextField
              label="Description"
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                }
              }}
            />
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.status}
              sx={{ mt: 2 }}
            >
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                {...register("status")}
                defaultValue={initialData?.status || "inactive"}
                sx={{ 
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                }}
              >
                <MenuItem 
                  value="active"
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.15),
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="ACTIVE" 
                      size="small" 
                      color="success" 
                      sx={{ height: 24, fontWeight: 600 }}
                    />
                    <Typography>Ready to run</Typography>
                  </Box>
                </MenuItem>
                <MenuItem 
                  value="inactive"
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.text.secondary, 0.15),
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="INACTIVE" 
                      size="small" 
                      sx={{ height: 24, fontWeight: 600 }}
                    />
                    <Typography>Paused</Typography>
                  </Box>
                </MenuItem>
              </Select>
              {errors.status && (
                <Typography color="error" variant="caption">
                  {errors.status.message}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box 
            sx={{ 
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.secondary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: theme.palette.secondary.light,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LinkedInIcon fontSize="small" />
              Lead Targets
            </Typography>
            
            <Box
              sx={{ 
                display: "flex", 
                gap: 1, 
                mb: 2, 
                alignItems: "flex-start",
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                label="Add LinkedIn URL"
                value={newLead}
                onChange={(e) => setNewLead(e.target.value)}
                fullWidth
                size="small"
                error={!!errors.leads}
                helperText={errors.leads?.message}
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, opacity: 0.7 }} />,
                  sx: {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.secondary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.secondary.main,
                      borderWidth: 2,
                    },
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddLead}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.palette.secondary.dark,
                  },
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: '120px' },
                  height: 40,
                }}
              >
                Add Lead
              </Button>
            </Box>
            
            <Box 
              sx={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: 1,
                p: leads.length > 0 ? 2 : 0,
                background: leads.length > 0 ? alpha('#1e293b', 0.4) : 'transparent',
                borderRadius: 2,
                border: leads.length > 0 ? `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` : 'none',
                minHeight: leads.length > 0 ? 60 : 0,
              }}
            >
              {leads.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center', width: '100%' }}>
                  No leads added yet. Add LinkedIn profiles to target.
                </Typography>
              )}
              
              {leads.map((lead, index) => (
                <Chip
                  key={index}
                  label={lead}
                  onDelete={() => handleRemoveLead(index)}
                  deleteIcon={<DeleteIcon />}
                  icon={<LinkedInIcon />}
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    borderRadius: 2,
                    '& .MuiChip-label': {
                      px: 1,
                      fontWeight: 500,
                    },
                    "& .MuiChip-deleteIcon": {
                      color: theme.palette.secondary.main,
                      "&:hover": {
                        color: theme.palette.secondary.dark,
                      },
                    },
                    "& .MuiChip-icon": {
                      color: theme.palette.secondary.main,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box 
            sx={{ 
              mb: 2,
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: theme.palette.info.light,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AccountCircleIcon fontSize="small" />
              Accounts
            </Typography>
            
            <FormControl 
              fullWidth 
              error={!!errors.accounts}
              sx={{ mb: 1 }}
            >
              <InputLabel id="accounts-label">Select Accounts</InputLabel>
              <Select
                labelId="accounts-label"
                multiple
                value={selectedAccounts}
                onChange={(e) =>
                  setValue("accounts", e.target.value as string[])
                }
                input={
                  <OutlinedInput 
                    label="Select Accounts" 
                    sx={{ 
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.info.main,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.info.main,
                        borderWidth: 2,
                      },
                    }}
                  />
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const account = accounts.find((a) => a._id === value);
                      return (
                        <Chip
                          key={value}
                          label={account?.name || value}
                          size="small"
                          icon={<AccountCircleIcon fontSize="small" />}
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            borderRadius: 2,
                            '& .MuiChip-label': {
                              fontWeight: 500,
                            },
                            "& .MuiChip-icon": {
                              color: theme.palette.info.main,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: alpha('#0f172a', 0.95),
                      backdropFilter: 'blur(20px)',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    }
                  }
                }}
              >
                {accounts.map((account) => (
                  <MenuItem 
                    key={account._id} 
                    value={account._id}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.info.main, 0.15),
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircleIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
                      {account.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.accounts && (
                <Typography color="error" variant="caption">
                  {errors.accounts.message}
                </Typography>
              )}
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Select the accounts that will be used for this campaign
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ 
          borderTop: "1px solid", 
          borderColor: alpha(theme.palette.primary.main, 0.1),
          px: 3, 
          py: 2,
          gap: 2
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            borderColor: alpha(theme.palette.divider, 0.5),
            "&:hover": {
              bgcolor: alpha(theme.palette.divider, 0.05),
              borderColor: alpha(theme.palette.divider, 0.8),
            },
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isSubmitting}
          endIcon={isSubmitting ? undefined : <ArrowForwardIcon />}
          sx={{
            bgcolor: "primary.main",
            background: "linear-gradient(90deg, #6d28d9, #5b21b6)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(90deg, #8b5cf6, #6d28d9)",
              boxShadow: '0 4px 15px rgba(109, 40, 217, 0.4)',
            },
            "&.Mui-disabled": {
              bgcolor: alpha(theme.palette.action.disabledBackground, 0.8),
              color: theme.palette.action.disabled,
            },
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : initialData ? "Update Campaign" : "Create Campaign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};