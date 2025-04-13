import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Campaign as CampaignIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { CampaignList } from "./components/CampaignList";
import { CampaignForm } from "./components/CampaignForm";
import { MessageGenerator } from "./components/MessageGenerator";
import { Campaign } from "./types";
import { campaignApi } from "./services/api";
import "./index.css";
import "./App.css";

// Simplified theme with minimal typography customization
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
    secondary: {
      main: "#ff3333",
      light: "#ff6666",
      dark: "#cc0000",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "rgba(0, 0, 0, 0.7)",
    },
    divider: "rgba(0, 0, 0, 0.12)",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "none",
          fontWeight: 500,
          padding: "8px 16px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          boxShadow: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        },
      },
    },
  },
});

function App() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignApi.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(undefined);
    setFormOpen(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormOpen(true);
  };

  const handleDeleteCampaign = async (id) => {
    try {
      await campaignApi.delete(id);
      setCampaigns(campaigns.filter((campaign) => campaign._id !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleSubmitCampaign = async (data) => {
    try {
      if (selectedCampaign) {
        if (!selectedCampaign._id) {
          throw new Error("Invalid campaign data");
        }
        const updatedCampaign = await campaignApi.update(
          selectedCampaign._id,
          data
        );
        setCampaigns(
          campaigns.map((campaign) =>
            campaign._id === updatedCampaign.data._id
              ? updatedCampaign.data
              : campaign
          )
        );
      } else {
        const newCampaign = await campaignApi.create(data);
        setCampaigns([...campaigns, newCampaign.data]);
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving campaign:", error);
      if (error.response?.data) {
        const errorMessage =
          error.response.data.message || "Failed to save campaign";
        const errorDetails = error.response.data.details;
        if (errorDetails) {
          const detailsMessage = Object.entries(errorDetails)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          throw new Error(`${errorMessage} (${detailsMessage})`);
        }
        throw new Error(errorMessage);
      }
      throw new Error("Failed to save campaign. Please try again.");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const updatedCampaign = await campaignApi.update(id, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
      setCampaigns(
        campaigns.map((campaign) =>
          campaign._id === updatedCampaign.data._id
            ? updatedCampaign.data
            : campaign
        )
      );
    } catch (error) {
      console.error("Error updating campaign status:", error);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          OutfloAI
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <CampaignIcon />
          </ListItemIcon>
          <ListItemText primary="Campaigns" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex" }}>
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                OutfloAI
              </Typography>
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCampaign}
                >
                  Create Campaign
                </Button>
              )}
            </Toolbar>
          </AppBar>

          {!isMobile && (
            <Drawer
              variant="permanent"
              sx={{
                width: 250,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: 250,
                  boxSizing: "border-box",
                  borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                },
              }}
            >
              {drawer}
            </Drawer>
          )}

          {isMobile && (
            <Drawer
              variant="temporary"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  width: 250,
                  boxSizing: "border-box",
                },
              }}
            >
              {drawer}
            </Drawer>
          )}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - 250px)` },
              mt: "64px",
            }}
          >
            <Container maxWidth="lg">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Typography variant="h4" component="h1">
                          Campaigns
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleCreateCampaign}
                        >
                          Create Campaign
                        </Button>
                      </Box>
                      <CampaignList
                        campaigns={campaigns}
                        loading={false}
                        error={null}
                        onEdit={handleEditCampaign}
                        onDelete={handleDeleteCampaign}
                        onStatusChange={handleStatusChange}
                      />
                    </Box>
                  }
                />
                <Route
                  path="/message-generator/:campaignId"
                  element={<MessageGenerator campaignId="1" />}
                />
              </Routes>
            </Container>
          </Box>
        </Box>

        <CampaignForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmitCampaign}
          initialData={selectedCampaign}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
