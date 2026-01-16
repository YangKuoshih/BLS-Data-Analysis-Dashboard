import requests
import json
import pandas as pd
from datetime import datetime

class BLSDataFetcher:
    def __init__(self):
        self.api_url = "https://api.bls.gov/publicAPI/v1/timeseries/data/"
        self.headers = {'Content-type': 'application/json'}

        # Series Mapping
        self.series_map = {
            "LNS14000000": "Unemployment Rate",
            "CES0000000001": "Total Nonfarm Employment",
            "CES0500000003": "Average Hourly Earnings",
            "CUSR0000SA0": "CPI (Seasonally Adjusted)"
        }

    def fetch_data(self, start_year=None, end_year=None):
        if not start_year:
            start_year = str(datetime.now().year - 9) # Last 10 years including current
        if not end_year:
            end_year = str(datetime.now().year)

        series_ids = list(self.series_map.keys())

        payload = json.dumps({
            "seriesid": series_ids,
            "startyear": start_year,
            "endyear": end_year
        })

        try:
            response = requests.post(self.api_url, data=payload, headers=self.headers)
            response.raise_for_status()
            json_data = response.json()

            if json_data['status'] != 'REQUEST_SUCCEEDED':
                print(f"API Error: {json_data['message']}")
                # Even if status is not success, sometimes it returns partial data or messages
                # But for V1 it might be stricter.
                # Let's proceed to parse what we have if 'Results' exists.

            return self._process_data(json_data)

        except Exception as e:
            print(f"Error fetching data: {e}")
            return pd.DataFrame()

    def _process_data(self, json_data):
        all_data = []

        if 'Results' not in json_data or 'series' not in json_data['Results']:
            return pd.DataFrame()

        for series in json_data['Results']['series']:
            series_id = series['seriesID']
            series_name = self.series_map.get(series_id, series_id)

            for item in series['data']:
                year = item['year']
                period = item['period']
                value = item['value']

                # Filter for monthly data only (M01-M12)
                if 'M01' <= period <= 'M12':
                    month = int(period[1:])
                    date = f"{year}-{month:02d}-01"

                    try:
                        float_value = float(value)
                    except ValueError:
                        float_value = None

                    if float_value is not None:
                        all_data.append({
                            'Series ID': series_id,
                            'Series Name': series_name,
                            'Date': date,
                            'Value': float_value,
                            'Year': int(year),
                            'Month': month
                        })

        df = pd.DataFrame(all_data)
        if not df.empty:
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.sort_values(by=['Series Name', 'Date'])

        return df

if __name__ == "__main__":
    fetcher = BLSDataFetcher()
    df = fetcher.fetch_data()
    print(df.head())
    print(df['Series Name'].unique())
