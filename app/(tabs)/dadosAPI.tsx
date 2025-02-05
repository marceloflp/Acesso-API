import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function dadosAPI(){
  const [repos, setRepos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  const [repoId, setRepoId] = useState('');
  const [loading, setLoading] = useState(false);

  // Carregar dados do AsyncStorage ao iniciar
  useEffect(() => {
    const loadRepos = async () => {
      const storedRepos = await AsyncStorage.getItem('repos');
      if (storedRepos) {
        setRepos(JSON.parse(storedRepos));
      }
    };

    loadRepos();
  }, []);

  // Função para buscar repositório na API
  const fetchRepoData = async (owner, repo) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
      const data = response.data;

      // Dados do repositório
      const repoData = {
        repoNome: data.name,
        repoDescricao: data.description || 'Sem descrição',
        nomeUsuario: data.owner.login,
        tipo: data.owner.type,
        linguagem: data.language,
      };

      // Adiciona o repositório na lista
      const updatedRepos = [...repos, repoData];
      setRepos(updatedRepos);
      await AsyncStorage.setItem('repos', JSON.stringify(updatedRepos));
    } catch (error) {
      console.error("Erro ao buscar repositório:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar os dados
  const limparDados = async () => {
    await AsyncStorage.removeItem('repos');
    setRepos([]);
  };

  // Função para adicionar repositório ao clicar no botão "Adicionar"
  const handleAddRepo = () => {
    if (ownerId && repoId) {
      fetchRepoData(ownerId, repoId);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.button}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={limparDados}>
          <Text style={styles.button}>-</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adicionar</Text>
            <TextInput
              style={styles.input}
              placeholder="Owner ID"
              value={ownerId}
              onChangeText={setOwnerId}
            />
            <TextInput
              style={styles.input}
              placeholder="Repo ID"
              value={repoId}
              onChangeText={setRepoId}
            />
             <View style={styles.buttonsContainer}>
              <Button title="Adicionar" onPress={handleAddRepo} disabled={loading} />
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={repos}
        renderItem={({ item }) => (
          <View style={styles.repoItem}>
            <Text style={styles.repoText}>Repositório: {item.repoNome}</Text>
            <Text>Descrição: {item.repoDescricao}</Text>
            <Text>Donos: {item.nomeUsuario} ({item.tipo})</Text>
            <Text>Linguagem: {item.linguagem}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 30,
    marginLeft: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  repoItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgb(77, 156, 236)',
    borderRadius: 5,
  },
  repoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
