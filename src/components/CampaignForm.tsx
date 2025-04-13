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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
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
  const [newLead, setNewLead] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accounts] = useState<Account[]>(DUMMY_ACCOUNTS);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    try {
      // Ensure leads array has at least one item
      if (!data.leads || data.leads.length === 0) {
        setError("At least one lead is required");
        return;
      }

      // Ensure accounts array has at least one item
      if (!data.accounts || data.accounts.length === 0) {
        setError("At least one account is required");
        return;
      }

      // Validate LinkedIn URLs
      const invalidLead = data.leads.find(
        (lead) => !/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(lead)
      );
      if (invalidLead) {
        setError(`Invalid LinkedIn URL: ${invalidLead}`);
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
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle
        sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}
      >
        <Typography variant="h6" component="div">
          {initialData ? "Edit Campaign" : "Create Campaign"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          <TextField
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
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
          />
          <FormControl fullWidth margin="normal" error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              {...register("status")}
              defaultValue={initialData?.status || "inactive"}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {errors.status && (
              <Typography color="error" variant="caption">
                {errors.status.message}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Leads (LinkedIn URLs)
            </Typography>
            <Box
              sx={{ display: "flex", gap: 1, mb: 1, alignItems: "flex-start" }}
            >
              <TextField
                label="Add LinkedIn URL"
                value={newLead}
                onChange={(e) => setNewLead(e.target.value)}
                fullWidth
                size="small"
                error={!!errors.leads}
                helperText={errors.leads?.message}
              />
              <Button
                variant="contained"
                onClick={handleAddLead}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {leads.map((lead, index) => (
                <Chip
                  key={index}
                  label={lead}
                  onDelete={() => handleRemoveLead(index)}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    "& .MuiChip-deleteIcon": {
                      color: "secondary.main",
                      "&:hover": {
                        color: "secondary.dark",
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Accounts
            </Typography>
            <FormControl fullWidth error={!!errors.accounts}>
              <InputLabel>Select Accounts</InputLabel>
              <Select
                multiple
                value={selectedAccounts}
                onChange={(e) =>
                  setValue("accounts", e.target.value as string[])
                }
                input={<OutlinedInput label="Select Accounts" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const account = accounts.find((a) => a._id === value);
                      return (
                        <Chip
                          key={value}
                          label={account?.name || value}
                          sx={{
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            color: "text.primary",
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {accounts.map((account) => (
                  <MenuItem key={account._id} value={account._id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.accounts && (
                <Typography color="error" variant="caption">
                  {errors.accounts.message}
                </Typography>
              )}
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2 }}
      >
        <Button
          onClose={onClose}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "text.disabled",
            },
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
