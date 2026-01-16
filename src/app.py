import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from data_fetcher import BLSDataFetcher
from utils import calculate_changes, get_latest_metrics
import pandas as pd

# Page Config
st.set_page_config(
    page_title="US Economic Dashboard",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern look
st.markdown("""
    <style>
    /* Customize Streamlit's default metric styling if needed,
       but for now we rely on the default look which is clean. */
    </style>
""", unsafe_allow_html=True)

@st.cache_data(ttl=3600) # Cache data for 1 hour
def load_data():
    fetcher = BLSDataFetcher()
    df = fetcher.fetch_data()
    if not df.empty:
        df = calculate_changes(df)
    return df

def create_trend_chart(df, series_name, title, y_title, show_recessions=True):
    series_data = df[df['Series Name'] == series_name]

    fig = px.line(series_data, x='Date', y='Value', title=title)

    if show_recessions:
        # NBER Recession Dates (Last 15 years approx)
        # Feb 2020 to April 2020
        fig.add_vrect(
            x0="2020-02-01", x1="2020-04-01",
            fillcolor="grey", opacity=0.15,
            layer="below", line_width=0,
            annotation_text="Recession", annotation_position="top left"
        )

    fig.update_layout(
        xaxis_title="",
        yaxis_title=y_title,
        template="plotly_white",
        hovermode="x unified",
        margin=dict(l=20, r=20, t=40, b=20)
    )
    return fig

def main():
    st.title("🇺🇸 US Economic Dashboard")
    st.markdown("### Key Economic Indicators from the Bureau of Labor Statistics")

    # Load Data
    with st.spinner('Fetching latest data from BLS...'):
        df = load_data()

    if df.empty:
        st.error("Failed to load data. Please check your internet connection or try again later.")
        return

    # Key Metrics Row
    metrics = {
        "Unemployment Rate": {"format": "{:.1f}%", "delta_format": "{:+.1f} pp"},
        "CPI (Seasonally Adjusted)": {"format": "{:.1f}", "delta_format": "{:+.1f}% (YoY)"}, # Using YoY for CPI
        "Total Nonfarm Employment": {"format": "{:,.0f} k", "delta_format": "{:+,.0f} k"},
        "Average Hourly Earnings": {"format": "${:.2f}", "delta_format": "{:+.1f}% (YoY)"}
    }

    cols = st.columns(len(metrics))

    for i, (name, settings) in enumerate(metrics.items()):
        data = get_latest_metrics(df, name)
        if data:
            with cols[i]:
                # Determine delta (special handling for specific metrics)
                if name == "Unemployment Rate":
                    delta = data['mom_change']
                    delta_str = settings['delta_format'].format(delta)
                elif name == "Total Nonfarm Employment":
                     delta = data['mom_change']
                     delta_str = settings['delta_format'].format(delta)
                else: # CPI and Earnings usually looked at YoY
                    delta = data['yoy_pct_change']
                    delta_str = settings['delta_format'].format(delta)

                st.metric(
                    label=name,
                    value=settings['format'].format(data['value']),
                    delta=delta_str
                )

    st.markdown("---")

    # Tabs for detailed analysis
    tab1, tab2, tab3, tab4 = st.tabs(["Unemployment", "Inflation (CPI)", "Jobs", "Earnings"])

    with tab1:
        st.subheader("Unemployment Rate Analysis")
        col1, col2 = st.columns([2, 1])

        with col1:
            fig = create_trend_chart(df, "Unemployment Rate", "Unemployment Rate (Last 10 Years)", "Rate (%)")
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            st.info("""
            **The Unemployment Rate** represents the number of unemployed as a percentage of the labor force.

            Key insights:
            - A low unemployment rate generally indicates a tight labor market.
            - Spikes usually correspond to economic recessions.
            """)
            latest = get_latest_metrics(df, "Unemployment Rate")
            if latest:
                st.write(f"**Current Rate:** {latest['value']}%")
                st.write(f"**Change from last month:** {latest['mom_change']:+.1f} pp")
                st.write(f"**Data as of:** {latest['date'].strftime('%B %Y')}")

    with tab2:
        st.subheader("Inflation (CPI) Analysis")
        col1, col2 = st.columns([2, 1])

        with col1:
            # For CPI, showing YoY change is often more useful than the index itself for inflation
            cpi_data = df[df['Series Name'] == "CPI (Seasonally Adjusted)"]
            fig_cpi = px.line(cpi_data, x='Date', y='YoY % Change', title="Inflation Rate (CPI YoY % Change)")
            fig_cpi.add_bar(x=cpi_data['Date'], y=cpi_data['YoY % Change'], name='Inflation')
            fig_cpi.update_layout(template="plotly_white", yaxis_title="YoY Change (%)")
            st.plotly_chart(fig_cpi, use_container_width=True)

        with col2:
            st.info("""
            **The Consumer Price Index (CPI)** measures the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services.

            Key insights:
            - The chart shows the Year-over-Year percentage change, commonly cited as the **Inflation Rate**.
            - The Federal Reserve targets an average inflation rate of 2%.
            """)
            latest = get_latest_metrics(df, "CPI (Seasonally Adjusted)")
            if latest:
                st.write(f"**Current Index:** {latest['value']}")
                st.write(f"**Inflation Rate (YoY):** {latest['yoy_pct_change']:.1f}%")

    with tab3:
        st.subheader("Employment Situation")
        col1, col2 = st.columns([2, 1])

        with col1:
            # Show monthly job gains/losses (MoM change)
            emp_data = df[df['Series Name'] == "Total Nonfarm Employment"]
            fig_jobs = px.bar(emp_data, x='Date', y='MoM Change', title="Monthly Job Gains/Losses (Nonfarm Payrolls)")
            fig_jobs.update_layout(template="plotly_white", yaxis_title="Change in Employment (Thousands)")
            st.plotly_chart(fig_jobs, use_container_width=True)

        with col2:
            st.info("""
            **Total Nonfarm Employment** is a measure of the number of U.S. workers in the economy that excludes proprietors, private household employees, unpaid volunteers, farm employees, and the unincorporated self-employed.

            Key insights:
            - Positive bars indicate job growth.
            - Negative bars indicate job losses.
            """)
            latest = get_latest_metrics(df, "Total Nonfarm Employment")
            if latest:
                st.write(f"**Total Employment:** {latest['value']:,.0f} k")
                st.write(f"**Jobs Added/Lost (Last Month):** {latest['mom_change']:+,.0f} k")

    with tab4:
        st.subheader("Wage Growth")
        col1, col2 = st.columns([2, 1])

        with col1:
            earnings_data = df[df['Series Name'] == "Average Hourly Earnings"]
            fig_wages = px.line(earnings_data, x='Date', y='YoY % Change', title="Wage Growth (YoY % Change in Avg Hourly Earnings)")
            fig_wages.update_layout(template="plotly_white", yaxis_title="YoY Change (%)")
            st.plotly_chart(fig_wages, use_container_width=True)

        with col2:
            st.info("""
            **Average Hourly Earnings** for all employees on private nonfarm payrolls.

            Key insights:
            - Increasing wage growth can be a sign of a strengthening labor market but can also contribute to inflation.
            """)
            latest = get_latest_metrics(df, "Average Hourly Earnings")
            if latest:
                st.write(f"**Avg Hourly Earnings:** ${latest['value']:.2f}")
                st.write(f"**Wage Growth (YoY):** {latest['yoy_pct_change']:.1f}%")

    # Data Table
    with st.expander("View Raw Data"):
        st.dataframe(df.sort_values(by=['Date', 'Series Name'], ascending=[False, True]), use_container_width=True)

if __name__ == "__main__":
    main()
