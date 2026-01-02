import pandas as pd

def calculate_changes(df):
    """
    Calculates Month-over-Month (MoM) and Year-over-Year (YoY) changes.
    Assumes df has columns: 'Series Name', 'Date', 'Value' and is sorted.
    """
    processed_dfs = []

    for name, group in df.groupby('Series Name'):
        group = group.copy().sort_values('Date')
        group['MoM Change'] = group['Value'].diff()
        group['MoM % Change'] = group['Value'].pct_change() * 100
        group['YoY % Change'] = group['Value'].pct_change(periods=12) * 100
        processed_dfs.append(group)

    return pd.concat(processed_dfs)

def get_latest_metrics(df, series_name):
    """
    Returns the latest value, MoM change, and YoY change for a given series.
    """
    series_data = df[df['Series Name'] == series_name]
    if series_data.empty:
        return None

    latest = series_data.iloc[-1]

    return {
        'date': latest['Date'],
        'value': latest['Value'],
        'mom_change': latest['MoM Change'],
        'mom_pct_change': latest['MoM % Change'],
        'yoy_pct_change': latest['YoY % Change']
    }
