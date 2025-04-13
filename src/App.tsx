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
      main: "#6366f1", // Modern indigo
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#ec4899", // Modern pink
      light: "#f472b6",
      dark: "#db2777",
    },
    background: {
      default: "#f8fafc",
      paper: "rgba(255, 255, 255, 0.8)",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "rgba(148, 163, 184, 0.12)",
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h1: { 
      fontWeight: 700,
      letterSpacing: "-0.025em"
    },
    h2: { 
      fontWeight: 700,
      letterSpacing: "-0.025em"
    },
    h3: { 
      fontWeight: 600,
      letterSpacing: "-0.025em"
    },
    h4: { 
      fontWeight: 600,
      letterSpacing: "-0.025em"
    },
    h5: { 
      fontWeight: 600,
      letterSpacing: "-0.025em"
    },
    h6: { 
      fontWeight: 600,
      letterSpacing: "-0.025em"
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.025em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 20px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(148, 163, 184, 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid rgba(148, 163, 184, 0.1)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
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
              p: { xs: 1, sm: 2, md: 3 },
              width: { sm: `calc(100% - ${drawerOpen ? '250px' : '0px'})` },
              mt: { xs: "56px", sm: "64px" },
              transition: "all 0.3s ease",
            }}
          >
            <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "stretch", sm: "center" },
                          gap: { xs: 2, sm: 0 },
                          mb: { xs: 2, sm: 3 },
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          component="h1"
                          sx={{
                            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                            textAlign: { xs: "center", sm: "left" }
                          }}
                        >
                          Campaigns
                        </Typography>
                        {isMobile ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateCampaign}
                            fullWidth
                            sx={{
                              py: 1.5,
                            }}
                          >
                            Create Campaign
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateCampaign}
                          >
                            Create Campaign
                          </Button>
                        )}
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
