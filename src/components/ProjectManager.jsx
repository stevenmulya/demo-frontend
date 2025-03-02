import { useState, useEffect } from "react";

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        project_name: "",
        project_image: null,
        project_description: "",
        project_details: "",
        project_date: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch("https://demo-backend-weld-zeta.vercel.app/projects");
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const addProject = async () => {
        if (!newProject.project_name || !newProject.project_image) {
            setMessage("Project name and image are required.");
            return;
        }

        if (newProject.project_image.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (!newProject.project_image.type.startsWith('image/')) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("project_name", newProject.project_name);
            formData.append("project_image", newProject.project_image);
            formData.append("project_description", newProject.project_description);
            formData.append("project_details", newProject.project_details);
            formData.append("project_date", newProject.project_date);

            const response = await fetch("https://demo-backend-weld-zeta.vercel.app/projects", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Project added successfully!");
                fetchProjects();
                setNewProject({
                    project_name: "",
                    project_image: null,
                    project_description: "",
                    project_details: "",
                    project_date: "",
                });
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add project: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding project:", error);
            setMessage(`Failed to add project: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteProject = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`https://demo-backend-weld-zeta.vercel.app/projects/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setMessage("Project deleted successfully!");
                fetchProjects();
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            setMessage("Failed to delete project.");
        }
        setLoading(false);
    };
    return (
      <div style={styles.container}>
          

          {message && <p style={styles.message}>{message}</p>}

          <div style={styles.formContainer}>
              <input style={styles.input} type="text" placeholder="Project Name" value={newProject.project_name} onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })} />
              <input style={styles.input} type="file" accept="image/*" onChange={(e) => setNewProject({ ...newProject, project_image: e.target.files[0] })} />
              <input style={styles.input} type="text" placeholder="Description" value={newProject.project_description} onChange={(e) => setNewProject({ ...newProject, project_description: e.target.value })} />
              <input style={styles.input} type="text" placeholder="Details" value={newProject.project_details} onChange={(e) => setNewProject({ ...newProject, project_details: e.target.value })} />
              <input style={styles.input} type="date" value={newProject.project_date} onChange={(e) => setNewProject({ ...newProject, project_date: e.target.value })} />
              <button style={styles.addButton} onClick={addProject} disabled={loading}>
                  {loading ? "Adding..." : "Add Project"}
              </button>
          </div>

          <div style={styles.grid}>
              {projects.map((project) => (
                  <div key={project.id} style={styles.card}>
                      <img src={project.project_image} alt={project.project_name} style={styles.image} />
                      <h2 style={styles.projectName}>{project.project_name}</h2>
                      <div style={styles.cardDetails}>
                          <p style={styles.detailText}>{project.project_description}</p>
                          <p style={styles.detailText}><strong>Details:</strong> {project.project_details}</p>
                          <p style={styles.detailText}><strong>Date:</strong> {project.project_date}</p>
                      </div>
                      <button style={styles.deleteButton} onClick={() => deleteProject(project.id)} disabled={loading}>
                          {loading ? "Deleting..." : "Delete"}
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );
};

const styles = {
  container: {
    textAlign: "left",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "25px",
    color: "#fff",
    fontFamily: 'Playfair Display',
  },
  message: {
    color: "#ccc",
    marginBottom: "15px",
    fontSize: "16px",
  },
  formContainer: {
    background: "#111",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 5px 10px rgba(255, 255, 255, 0.1)",
    marginBottom: "25px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#222",
    color: "#fff",
    marginBottom: "15px",
    fontSize: "16px",
  },
  addButton: {
    background: "#555",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
    marginTop: "25px",
  },
  card: {
    background: "#1a1a1a",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 5px 10px rgba(255, 255, 255, 0.1)",
    transition: "transform 0.3s ease",
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "20px",
    height: "220px",
    objectFit: "cover",
  },
  projectName: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "15px",
    fontFamily: 'Playfair Display',
  },
  cardDetails: {
    marginBottom: "20px",
  },
  detailText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#ccc",
  },
  deleteButton: {
    background: "#333",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
    fontSize: "16px",
  },
};

export default ProjectManager;