import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Typography,
  Box,
  Skeleton,
  Chip,
  Tooltip,
  Alert,
  TablePagination,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Campaign } from "../types";
import { campaignApi } from "../services/api";

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    id: string,
    currentStatus: Campaign["status"]
  ) => Promise<void>;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  loading,
  error,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: string) => {
    setCampaignToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (campaignToDelete) {
      onDelete(campaignToDelete);
      setDeleteConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setCampaignToDelete(null);
  };

  const renderLoadingSkeleton = () => {
    return Array.from(new Array(5)).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton animation="wave" height={40} />
        </TableCell>
        <TableCell>
          <Skeleton animation="wave" height={40} />
        </TableCell>
        <TableCell>
          <Skeleton animation="wave" height={40} width={60} />
        </TableCell>
        <TableCell>
          <Skeleton animation="wave" height={40} width={100} />
        </TableCell>
      </TableRow>
    ));
  };

  const renderStatusChip = (status: "active" | "inactive") => {
    return (
      <Chip
        label={status}
        color={status === "active" ? "success" : "default"}
        size="small"
        sx={{
          fontWeight: 500,
          "& .MuiChip-label": {
            px: 1,
          },
        }}
      />
    );
  };

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton
            aria-label="refresh"
            color="inherit"
            size="small"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Leads</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Accounts</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? renderLoadingSkeleton()
                : campaigns
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((campaign) => (
                      <TableRow
                        key={campaign._id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {campaign.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: isMobile ? 150 : 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {campaign.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            {renderStatusChip(campaign.status)}
                            <Tooltip
                              title={`Switch to ${
                                campaign.status === "active"
                                  ? "Inactive"
                                  : "Active"
                              }`}
                            >
                              <Switch
                                checked={campaign.status === "active"}
                                onChange={() => {
                                  if (!campaign._id) {
                                    console.error(
                                      "Campaign ID is missing:",
                                      campaign
                                    );
                                    return;
                                  }
                                  onStatusChange(campaign._id, campaign.status);
                                }}
                                size="small"
                                color="success"
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {campaign.leads?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              {campaign.leads?.length === 1 ? "lead" : "leads"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {campaign.accounts?.length || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit campaign">
                              <IconButton
                                onClick={() => onEdit(campaign)}
                                size="small"
                                sx={{
                                  color: "primary.main",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                    color: "primary.dark",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete campaign">
                              <IconButton
                                onClick={() => handleDeleteClick(campaign._id)}
                                size="small"
                                sx={{
                                  color: "error.main",
                                  "&:hover": {
                                    backgroundColor: "error.light",
                                    color: "error.dark",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={campaigns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{
              bgcolor: "error.main",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
