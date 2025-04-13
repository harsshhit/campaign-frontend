import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
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
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Campaign as CampaignIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ChevronRight as ChevronRightIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { CampaignList } from "./components/CampaignList";
import { CampaignForm } from "./components/CampaignForm";
import { MessageGenerator } from "./components/MessageGenerator";
import { Campaign } from "./types";
import { campaignApi } from "./services/api";
import "./index.css";
import "./App.css";

// Enhanced modern futuristic theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6d28d9", // Deep purple
      light: "#8b5cf6",
      dark: "#5b21b6",
    },
    secondary: {
      main: "#10b981", // Emerald
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#0f172a", // Dark blue slate
      paper: "#1e293b", // Lighter blue slate
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#cbd5e1",
    },
    divider: "rgba(148, 163, 184, 0.15)",
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#3b82f6",
    },
    success: {
      main: "#10b981",
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Plus Jakarta Sans", "Inter", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.025em",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.025em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body {
          min-height: 100vh;
          width: 100%;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          background-attachment: fixed;
          background-size: cover;
          background-repeat: no-repeat;
          overflow-x: hidden;
        }
        
        #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Customize scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        ::-webkit-scrollbar-thumb {
          background: #4c1d95;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6d28d9;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 20px",
          transition: "all 0.3s ease-in-out",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(109, 40, 217, 0.25)",
            "&::before": {
              opacity: 1,
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)",
          boxShadow:
            "0 4px 14px rgba(109, 40, 217, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
          },
        },
        outlined: {
          borderColor: "#6d28d9",
          borderWidth: 2,
          "&:hover": {
            borderColor: "#8b5cf6",
            borderWidth: 2,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#0f172a", 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: alpha("#0f172a", 0.9),
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(139, 92, 246, 0.2)",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e293b",
          borderRadius: 20,
          border: "1px solid rgba(139, 92, 246, 0.2)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.1), 0 1px 2px rgba(139, 92, 246, 0.1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2), 0 1px 3px rgba(139, 92, 246, 0.2)",
            borderColor: "rgba(139, 92, 246, 0.3)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
          "&:hover": {
            background: alpha("#6d28d9", 0.2),
            transform: "scale(1.1)",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: "4px 8px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: alpha("#6d28d9", 0.15),
            transform: "translateX(4px)",
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#8b5cf6",
          minWidth: "40px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(139, 92, 246, 0.15)",
        },
      },
    },
  },
});

// Custom components
const GlowingLogo = () => (
  <Typography
    variant="h5"
    component="div"
    sx={{
      fontWeight: 700,
      background: "linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: "flex",
      alignItems: "center",
      gap: 1,
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)",
        filter: "blur(20px)",
        opacity: 0.6,
        zIndex: -1,
      },
    }}
  >
    <span style={{ color: "#8b5cf6", fontWeight: 800 }}>Outflo</span>
    <span
      style={{
        background: "linear-gradient(90deg, #3b82f6, #10b981)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      AI
    </span>
  </Typography>
);

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, onClick }) => (
  <ListItem
    button
    component={Link}
    to={to}
    onClick={onClick}
    sx={{
      py: 1.5,
      px: 2,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        background: "linear-gradient(to bottom, #8b5cf6, #10b981)",
        opacity: 0,
        transition: "opacity 0.3s ease",
      },
      "&:hover::before, &.active::before": {
        opacity: 1,
      },
    }}
  >
    <ListItemIcon sx={{ color: "primary.main" }}>{icon}</ListItemIcon>
    <ListItemText
      primary={text}
      primaryTypographyProps={{
        sx: {
          fontWeight: 500,
          transition: "all 0.2s ease",
        },
      }}
    />
    <ChevronRightIcon sx={{ opacity: 0.5, fontSize: 18 }} />
  </ListItem>
);

function App() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<
    Campaign | undefined
  >();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormOpen(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await campaignApi.delete(id);
      setCampaigns(campaigns.filter((campaign) => campaign._id !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleSubmitCampaign = async (
    data: Omit<Campaign, "_id" | "createdAt" | "updatedAt">
  ) => {
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
      if ((error as any).response?.data) {
        const errorMessage =
          (error as any).response.data.message || "Failed to save campaign";
        const errorDetails = (error as any).response.data.details;
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

  const handleStatusChange = async (
    id: string,
    currentStatus: Campaign["status"]
  ) => {
    try {
      // Only toggle between active and inactive
      if (currentStatus === "deleted") return;

      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const updatedCampaign = await campaignApi.update(id, {
        status: newStatus,
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
    <Box sx={{ width: 280 }}>
      <Box
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 80,
        }}
      >
        <GlowingLogo />
      </Box>
      <Divider />
      <Box sx={{ p: 2, mb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
          sx={{
            background: "linear-gradient(45deg, #6d28d9, #8b5cf6)",
            py: 1.5,
            borderRadius: 3,
            mb: 2,
          }}
        >
          Create Campaign
        </Button>
      </Box>
      <List sx={{ px: 1 }}>
        {/* <NavItem
          icon={<DashboardIcon />}
          text="Dashboard"
          to="/"
          onClick={() => isMobile && setDrawerOpen(false)}
        /> */}
        <NavItem
          icon={<CampaignIcon />}
          text="Campaigns"
          to="/campaigns"
          onClick={() => isMobile && setDrawerOpen(false)}
        />
        <NavItem
          icon={<MessageIcon />}
          text="Message Generator"
          to="/message-generator"
          onClick={() => isMobile && setDrawerOpen(false)}
        />
        <NavItem
          icon={<SettingsIcon />}
          text="Settings"
          to="/settings"
          onClick={() => isMobile && setDrawerOpen(false)}
        />
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box
        sx={{
          p: 3,
          mt: 4,
          mx: 2,
          borderRadius: 3,
          background:
            "linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="subtitle2" color="primary.light" sx={{ mb: 1 }}>
          AI Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Need help with your campaigns?
        </Typography>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            borderColor: "rgba(139, 92, 246, 0.5)",
            background: "rgba(109, 40, 217, 0.1)",
          }}
        >
          Get AI Help
        </Button>
      </Box>
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
            <Toolbar sx={{ height: 80 }}>
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

              {isMobile && <GlowingLogo />}

              <Box sx={{ flexGrow: 1 }} />

              <IconButton color="primary" sx={{ mr: 1 }}>
                <NotificationsIcon />
              </IconButton>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCampaign}
                sx={{
                  display: { xs: "none", md: "flex" },
                  background: "linear-gradient(45deg, #6d28d9, #8b5cf6)",
                }}
              >
                Create Campaign
              </Button>
            </Toolbar>
          </AppBar>

          {!isMobile && (
            <Drawer
              variant="permanent"
              sx={{
                width: 280,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: 280,
                  boxSizing: "border-box",
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
                  width: 280,
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
              width: {
                xs: "100%",
                sm: `calc(100% - ${drawerOpen ? "280px" : "0px"})`,
              },
              minHeight: "100vh",
              mt: { xs: "64px", sm: "80px" },
              transition: "all 0.3s ease",
              overflowX: "hidden",
              position: "relative",
            }}
          >
            <Container
              maxWidth="lg"
              sx={{
                px: { xs: 1, sm: 2, md: 3 },
                py: { xs: 2, sm: 3 },
                minHeight: "100%",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/campaigns" replace />}
                />
                <Route
                  path="/campaigns"
                  element={
                    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                      {/* Page header with gradient */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "stretch", sm: "center" },
                          gap: { xs: 2, sm: 0 },
                          mb: { xs: 3, sm: 4 },
                          p: 3,
                          borderRadius: 2,
                          background:
                            "linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05))",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                              "linear-gradient(90deg, #6d28d9, #10b981)",
                            zIndex: 1,
                          },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                              fontSize: {
                                xs: "1.75rem",
                                sm: "2.25rem",
                                md: "2.5rem",
                              },
                              fontWeight: 700,
                              background:
                                "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              mb: 1,
                            }}
                          >
                            Campaigns
                          </Typography>
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ maxWidth: 500 }}
                          >
                            Manage your outreach campaigns and track performance
                          </Typography>
                        </Box>
                        {isMobile ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateCampaign}
                            fullWidth
                            startIcon={<AddIcon />}
                            sx={{
                              py: 1.5,
                              background:
                                "linear-gradient(45deg, #6d28d9, #8b5cf6)",
                            }}
                          >
                            Create Campaign
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateCampaign}
                            startIcon={<AddIcon />}
                            sx={{
                              background:
                                "linear-gradient(45deg, #6d28d9, #8b5cf6)",
                            }}
                          >
                            Create Campaign
                          </Button>
                        )}
                      </Box>

                      {/* Campaign List */}
                      <Box
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          background: alpha("#1e293b", 0.6),
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        <CampaignList
                          campaigns={campaigns}
                          loading={false}
                          error={null}
                          onEdit={handleEditCampaign}
                          onDelete={handleDeleteCampaign}
                          onStatusChange={handleStatusChange}
                        />
                      </Box>
                    </Box>
                  }
                />
                <Route
                  path="/message-generator"
                  element={<MessageGenerator />}
                />
                <Route
                  path="/settings"
                  element={<Typography>Settings (Coming Soon)</Typography>}
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
