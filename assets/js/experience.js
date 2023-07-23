AOS.init();

//  Work experience cards

const experiencecards = document.querySelector(".experience-cards");

const envisionExperiences = [
  "Developed a comprehensive monitoring stack solution for seamless integration into existing services, enabling microservice providers to enhance observability and analysis.",
  "Implemented Docker Compose and Helm charts as a foundation for future projects, enabling easy scalability and maintenance",
  "Implemented Spring Aspect-Oriented Programming for monitoring aspects and self-contained modules,, allowing for custom metrics collection with minimal project modifications",
  "Utilized relevant Spring Boot libraries to dynamically generate Excel sheets based on user selection, reducing manual generation efforts",
  "Leveraged Spring Boot's Object-Relation Mapping (ORM) to develop a flexible solution for handling the storage and retrievalof complex and nested JSON objects, tailored to meet specificapplication requirements",
];

const autodeskExperiences = [
  "Developed a complete system to keep track of Autodesk's internal service-to-service proxy deployment metadata, saving service providers the time and effort of manual compilation",
  "Coded AWS Lambda function in JavaScript for core API logic. Mapped the needs of service providers to API features, allowing them to easily monitor service quality",
  "Debugged and identified bottleneck in Lambda execution by analyzing AWS CloudWatch logs, improving overall performance by 20%",
  "Decomposed data migration task and chose appropriate AWS services for different workloads, reducing execution cost by 40%",
  "Automated provisioning of AWS infrastructures using Terraform, reducing chances of human error",
  "Utilized Mocha, Sinon, Chai to write unit tests for API components, ensuring 80% test coverage"
];

const vibefamExperiences = [
  "Creating the interface and implementing the logic for studio owners to select the spots to be sold on ClassPass, enabling the integration of Vibefam with ClassPass studio aggregator",
  "Leveraged the conditional rendering in Vue to make the selection component responsive to change in user input",
  "Created application event to fire Firebase cloud function, ensuring the selection data is recorded correctly in Firestore database"
];

const dkmExperiences = [
  "Provided speedy and personalized feedback to over 300 students in Data Analysis course, achieving a pass rate of over 97%",
  "Identified the gaps between instructors' goal and students' capabilities, suggesting improvements in course structure and resulting in an increase the participation rate by 35%",
  "Incorporated AI Speech Recognition Tool to translate company's internal training videos, accelerating the translation process and improving the accuracy and efficiency of translation by 65%"
]

const formatExperiences = (experiences) => {
  let descriptionsFormatted = "";
  experiences.forEach(exp => (descriptionsFormatted += `<li>${exp}</li>`));
  return descriptionsFormatted;
}

const exp = [
  {
    title: "Backend Engineer Intern",
    subtitle: "",
    cardImage: "assets/images/experience-page/envision-digital.png",
    place: "Envision Digital (Singapore)",
    companyURL: "https://envision-digital.com/",
    time: "(May 2023 - Aug 2023)",
    desp: formatExperiences(envisionExperiences)
  },
  {
    title: "Software Developer Intern",
    subtitle: "(API Management Platform)",
    cardImage: "assets/images/experience-page/autodesk.png",
    place: "Autodesk (Singapore)",
    companyURL: "https://www.autodesk.com/",
    time: "(May 2022 - Nov 2022)",
    desp: formatExperiences(autodeskExperiences)
  },
  {
    title: "Freelance Software Engineer",
    subtitle: "",
    cardImage: "assets/images/experience-page/vibefam.png",
    place: "Vibefam (Singapore)",
    companyURL: "https://vibefam.com/",
    time: "(Nov 2022 - Dec 2023)",
    desp: formatExperiences(vibefamExperiences)
  },
  {
    title: "Part-time Teaching Assistant",
    subtitle: "Data Creative Academy",
    cardImage: "assets/images/experience-page/dkm.png",
    place: "Data Knowledge Management Ecosystem (Shanghai)",
    companyURL: "https://www.dkmeco.com/",
    time: "(June 2021 - Aug 2021)",
    desp: formatExperiences(dkmExperiences)
  }
];


const showCards = () => {
  let output = "";
  exp.forEach(
    ({ title, subtitle, cardImage, place, companyURL, time, desp }) =>
      (output += `        
    <div class="col gaap" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="400"> 
      <div class="card card1">
        <a href=${companyURL} target="_blank"><img src="${cardImage}" class="featured-image"/></a>
        <article class="card-body">
          <header>
            <div class="title">
              <h3>${title}</h3>
              <h5 align="right">${subtitle}</h5>
            </div>
            <p class="meta">
              <a href=${companyURL} target="_blank"><span class="pre-heading">${place}</span><br> </a>
              <span class="author">${time}</span>
            </p>
            <ul>
              ${desp}
            </ul>
          </header>
        </article>
      </div>
    </div>
      `)
  );
  experiencecards.innerHTML = output;
};

document.addEventListener("DOMContentLoaded", showCards);


