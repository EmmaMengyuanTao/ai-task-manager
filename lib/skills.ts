export const predefinedSkills = {
    programming: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C++",
        "C#",
        "Go",
        "Rust",
        "Ruby",
        "PHP",
        "Swift",
        "Kotlin"
    ],
    frontend: [
        "React",
        "Vue",
        "Angular",
        "Next.js",
        "HTML",
        "CSS",
        "SASS/SCSS",
        "Tailwind CSS",
        "Bootstrap",
        "jQuery"
    ],
    backend: [
        "Node.js",
        "Express",
        "Django",
        "Flask",
        "Spring Boot",
        "Laravel",
        "Ruby on Rails",
        "ASP.NET",
        "GraphQL",
        "REST API"
    ],
    database: [
        "MySQL",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "SQLite",
        "Oracle",
        "SQL Server",
        "Firebase",
        "DynamoDB"
    ],
    devops: [
        "Docker",
        "Kubernetes",
        "AWS",
        "Azure",
        "GCP",
        "CI/CD",
        "Git",
        "Jenkins",
        "Terraform",
        "Ansible"
    ],
    design: [
        "UI/UX Design",
        "Figma",
        "Adobe XD",
        "Sketch",
        "Photoshop",
        "Illustrator",
        "InDesign"
    ],
    mobile: [
        "React Native",
        "Flutter",
        "iOS Development",
        "Android Development",
        "Xamarin"
    ],
    testing: [
        "Unit Testing",
        "Integration Testing",
        "Jest",
        "Cypress",
        "Selenium",
        "Test-Driven Development"
    ],
    softSkills: [
        "Communication",
        "Teamwork",
        "Problem Solving",
        "Leadership",
        "Time Management",
        "Project Management",
        "Agile/Scrum"
    ]
};

export type SkillCategory = keyof typeof predefinedSkills;
export type Skill = string;

export const getAllSkills = (): Skill[] => {
    return Object.values(predefinedSkills).flat();
}; 