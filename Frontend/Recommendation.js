API_KEY ='AIzaSyAz4m6Y_zQ5DF3BnjasyUu3YN7TaY4oiMw'
 // This should be set in your environment variables

// Add debug log to check if script is loaded
console.log('Recommendation.js script loaded');

document.getElementById('travel-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  console.log('Form submitted');

  // Get form data
  const currentLocation = document.getElementById('current-location').value;
  const budget = document.getElementById('budget').value;
  const days = document.getElementById('days').value;
  const preferences = document.getElementById('preferences').value;

  console.log('Form values:', { currentLocation, budget, days, preferences });

  // Validate inputs
  if (!currentLocation || !budget || !days || !preferences) {
    console.log('Validation failed - missing fields');
    showError('Please fill in all fields');
    return;
  }

  const requestData = {
    contents: [{
      parts: [{
        text: `Suggest a travel destination based on the following preferences:\nLocation: ${currentLocation}\nBudget: ${budget} INR\nDays: ${days}\nPreferences: ${preferences}`
      }]
    }]
  };

  console.log('Making API request with data:', requestData);

  try {
    // Show loading state
    const recommendationResult = document.getElementById('recommendation-result');
    recommendationResult.innerHTML = '<div class="loading">Loading recommendations...</div>';

    // Make the request to the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch recommendations');
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No recommendations available');
    }

    // Extract the recommendation text from the response
    const recommendationText = data.candidates[0].content.parts[0].text;
    
    // Format the response text
    const formattedText = formatRecommendationText(recommendationText);
    
    recommendationResult.innerHTML = `
      <div class="recommendation-card show">
        <div class="card-header">
          <i class="fas fa-map-marker-alt"></i>
          <h3>Your Travel Recommendation</h3>
        </div>
        <div class="recommendation-content">
          ${formattedText}
        </div>
        <button id="explore-btn" class="explore-button">
          <i class="fas fa-compass"></i>
          Explore More
        </button>
      </div>
    `;

    // Scroll to the recommendation result section
    recommendationResult.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'An error occurred while fetching recommendations');
  }
});

function formatRecommendationText(text) {
  // Split the text into sections based on common headings
  const sections = text.split(/\n(?=[A-Z][a-z]+:)/);
  
  return sections.map(section => {
    // Check if the section starts with a heading
    if (section.includes(':')) {
      const [heading, content] = section.split(':');
      return `
        <div class="recommendation-section">
          <h4 class="section-heading">${heading.trim()}</h4>
          <div class="section-content">${formatContent(content.trim())}</div>
        </div>
      `;
    }
    return `<div class="general-content">${formatContent(section.trim())}</div>`;
  }).join('');
}

function formatContent(content) {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map(paragraph => {
    // Handle bullet points
    if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
      const items = paragraph.split('\n').map(item => item.trim());
      return `
        <ul class="content-list">
          ${items.map(item => `<li>${item.replace(/^[-•]\s*/, '')}</li>`).join('')}
        </ul>
      `;
    }
    
    // Handle numbered lists
    if (paragraph.trim().match(/^\d+\./)) {
      const items = paragraph.split('\n').map(item => item.trim());
      return `
        <ol class="content-list">
          ${items.map(item => `<li>${item.replace(/^\d+\.\s*/, '')}</li>`).join('')}
        </ol>
      `;
    }
    
    // Regular paragraph
    return `<p>${paragraph}</p>`;
  }).join('');
}

function showError(message) {
  const recommendationResult = document.getElementById('recommendation-result');
  recommendationResult.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
    </div>
  `;
  recommendationResult.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

document.querySelector('.hamburger').addEventListener('click', () => {
  const navLinks = document.querySelector('.navbar-links');
  navLinks.classList.toggle('show');
});
