import React from 'react';

const GitHubStats = () => (
  <section id="github-stats" className="github-stats-section">
    <h2>📊 GitHub Highlights</h2>
    <div className="github-cards">
      <img src="https://github-readme-streak-stats.herokuapp.com/?user=Tejaji-0&theme=radical" alt="GitHub Streak" className="github-card" />
      <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Tejaji-0&layout=compact&theme=radical&hide=html,css" alt="Top Languages" className="github-card" />
    </div>
  </section>
);

export default GitHubStats;
