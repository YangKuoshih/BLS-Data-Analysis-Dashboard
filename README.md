# US Economic Dashboard

A modern, professional dashboard for analyzing US economic data, built with [Streamlit](https://streamlit.io/) and [Plotly](https://plotly.com/).

## Overview

This dashboard fetches real-time data from the **Bureau of Labor Statistics (BLS) Public API** to visualize key economic indicators:

- **Unemployment Rate**
- **Consumer Price Index (CPI) & Inflation**
- **Total Nonfarm Employment**
- **Average Hourly Earnings**

It provides interactive charts with recession shading and calculates Month-over-Month (MoM) and Year-over-Year (YoY) metrics.

## Setup & Installation

To run this dashboard locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Set up a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the App

Run the Streamlit application:

```bash
streamlit run src/app.py
```

The dashboard will open in your default web browser (usually at `http://localhost:8501`).

## Data Source

This application uses the [BLS Public Data API v1](https://www.bls.gov/developers/api_signature_v2.htm).
*Note: The v1 API has a limit of 25 requests per day. Data is cached for 1 hour to optimize usage.*
