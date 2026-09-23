import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator,} from 'react-native';
import { CommonFunction, CommonApi, API_BASE_URL } from '@common';
import RPSGame from './RPSGame';


export default function App() {
  const { postResponse, loading } = useFetchApi();

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Expo App DEMO</Text>
        
        <View style={styles.item}>
          <Text style={styles.label}>Shared COMMON String:</Text>
          <Text>{CommonFunction('FromAPP')}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Shared API POST Result:</Text>
          {
            loading
            ? 
            <ActivityIndicator size="small" />
            : 
            <Text>AconcatB: {postResponse?.AconcatB}</Text>
          }
        </View>

        <RPSGame />

    </SafeAreaView>
  );
}

function useFetchApi() {
  const [postResponse, setPostResponse] = useState<CommonApi.Resp | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApi = async () => {
      const reqBody: CommonApi.Req = {
        A: "Hello Ex",
        B: "po World",
      };

      const resPost = await fetch(`${API_BASE_URL}/${CommonApi.Router}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      });

      const postData = await resPost.json();

      setPostResponse(postData);
      setLoading(false);
    };
    fetchApi();
  }, []);

  return { postResponse, loading };
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  item: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
