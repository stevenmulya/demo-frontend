export async function fetchAndDisplayProjects() {
    let projects = null;
    try {
      const response = await fetch("https://demo-backend-weld-zeta.vercel.app/projects");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      projects = await response.json();
      updateProjectsDisplay(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      const container = document.querySelector(".projects-container");
      if (container) {
        container.innerHTML = "<p class='loading-message'>Error loading projects.</p>";
      }
    }
  }
  
  function updateProjectsDisplay(projects) {
    const container = document.querySelector(".projects-container");
    if (container) {
      if (projects && projects.length > 0) {
        const projectHTML = projects.map(project => `
          <a href="/projects/${project.id}" class="project-link">
            <div class="project-item">
              <div class="project-image-container">
                <img src="${project.project_image}" alt="${project.project_name}" class="project-image" />
              </div>
              <div class="project-details">
                <h2>${project.project_name}</h2>
              </div>
            </div>
          </a>
        `).join('');
        container.innerHTML = projectHTML;
      } else {
        container.innerHTML = "<p class='loading-message'>No projects found.</p>";
      }
    }
  }