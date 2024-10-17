/* eslint-disable @next/next/no-img-element */
import React from 'react';
import img from "./profile.jpg"

export default function About() {
    return (
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center mb-8">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden ml-8">
                    <img
                        src={img.src}
                        alt="Vinay Putta"
                        className="object-cover w-full h-full object-center"
                    />
                </div>
                <h1 className="text-4xl font-bold font-lato ml-8">Vinay Putta</h1>
            </div>



            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-4 font-lato">Personal Profile</h2>
                <p className="text-gray-700 font-montserrat leading-relaxed">
                    As a software engineer, I specialize in back-end development with GoLang and front-end work using React and Angular. At Infosys, I have focused on developing complex features and plugins, particularly utilizing GoLang for calculations and API development. I have a keen interest in blockchain technology and web3, which I explore through side projects. I regularly write technical articles to share my learning experiences in the field of software development.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-4 font-lato">Work Experience</h2>
                <div className="mb-4">
                    <h6 className="text-2xl font-semibold font-montserrat mb-2">Backend Developer at Infosys (GoLang) + React.js + Angular</h6>
                    <p className="text-gray-600 font-montserrat mb-4">July 2022 - Present</p>
                    <ul className="list-disc pl-5 mt-2 font-montserrat">
                        <li>Developed a robust migrator tool in GoLang for seamless legacy code transition to modern technology.</li>
                        <li>Engineered a sophisticated Business Rule Extractor (BRE) to extract and translate intricate business rules.</li>
                        <li>Designed complex GoLang scripts to measure product development and its maturity.</li>
                        <li>Integrated with ALM tools such as JIRA, ADO, GitHub, and CA-Rally for streamlined workflows.</li>
                    </ul>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-4 font-lato">Skills</h2>
                <ul className="grid grid-cols-2 gap-4 font-montserrat">
                    <li>GoLang (Gin, Echo, HTTP frameworks)</li>
                    <li>React.js, Angular</li>
                    <li>HTML, CSS, JavaScript</li>
                    <li>MongoDB, GraphQL</li>
                    <li>Git version control</li>
                    <li>HTMX</li>
                    <li>Security and performance optimization</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-4 font-lato">Education</h2>
                <div className="mb-6">
                    <h6 className="text-2xl font-semibold font-montserrat mb-2">B.Tech in Computer Science</h6>
                    <p className="text-gray-600 font-montserrat mb-1">Santhiram Engineering College, 2019-2022</p>
                    <p className="font-montserrat">Percentage: 83.38%</p>
                </div>
                <div>
                    <h6 className="text-2xl font-semibold font-montserrat mb-2">Diploma - Mechanical Engineering</h6>
                    <p className="text-gray-600 font-montserrat mb-1">E.S.C Govt. Polytechnic, 2016-2019</p>
                    <p className="font-montserrat">Percentage: 75.13%</p>
                </div>
            </section>

            <footer className="text-center text-gray-600 font-montserrat">
                <div className="flex flex-wrap justify-center items-center -mx-2">
                    <a href="mailto:p.vinay1668@gmail.com" className="flex items-center hover:text-blue-600 w-1/2 sm:w-auto px-2 mb-4 sm:mb-0">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                        <span className="text-sm">p.vinay1668@gmail.com</span>
                    </a>
                    <a href="tel:8688643301" className="flex items-center hover:text-blue-600 w-1/2 sm:w-auto px-2 mb-4 sm:mb-0">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                        <span className="text-sm">8688643301</span>
                    </a>
                    <a href="https://github.com/vinay1668" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 w-1/2 sm:w-auto px-2 mb-4 sm:mb-0">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                        <span className="text-sm">GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/vinay1668/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 w-1/2 sm:w-auto px-2">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        <span className="text-sm">LinkedIn</span>
                    </a>
                </div>
            </footer>
        </div>
    );
}
