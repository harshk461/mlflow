import {
  Button,
  CopyIcon,
  Input,
  Modal,
  TabPane,
  Tabs,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';
import { CodeSnippet } from '@databricks/web-shared/snippet';
import { CopyButton } from '../../../shared/building_blocks/CopyButton';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  experimentId: string;
};

export const CreateNotebookRunModal = ({
  isOpen,
  closeModal,
  experimentId,
}: Props): JSX.Element => {
  const { theme } = useDesignSystemTheme();

  const classical_ml_text = `
  import mlflow 
  from sklearn.model_selection import train_test_split 
  from sklearn.datasets import load_diabetes
  import RandomForestRegressor 
  
  # set the experiment id
  mlflow.set_experiment(experiment_id="${experimentId}")
  
  mlflow.autolog() 
  db = load_diabetes() 
  
  X_train, X_test, y_train, y_test = train_test_split(db.data, db.target) 
  
  # Create and train models. 
  rf = RandomForestRegressor(n_estimators=100, max_depth=6, max_features=3) 
  rf.fit(X_train, y_train) 
  
  # Use the model to make predictions on the test dataset. 
  predictions = rf.predict(X_test)
  `;

  const llm_text = `
  import mlflow
  import openai
  
  # you must set the OPENAI_API_KEY environment variable
  assert "OPENAI_API_KEY" in os.environ, "Please set the OPENAI_API_KEY environment variable."
  
  # set the experiment id
  mlflow.set_experiment(experiment_id="${experimentId}")
  
  system_prompt = "The following is a conversation with an AI assistant. The assistant is helpful and very friendly."
  
  # start a run
  mlflow.start_run()
  mlflow.log_param("system_prompt", system_prompt)
  
  # Create a question answering model using prompt engineering with OpenAI. Log the model
  # to MLflow Tracking
  logged_model = mlflow.openai.log_model(
      model="gpt-3.5-turbo",
      task=openai.ChatCompletion,
      artifact_path="model",
      messages=[
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": "{question}"},
      ],
  )
  
  # Evaluate the model on some example questions
  questions = pd.DataFrame(
      {
          "question": [
              "How do you create a run with MLflow?",
              "How do you log a model with MLflow?",
              "What is the capital of France?",
          ]
      }
  )
  mlflow.evaluate(
      model=logged_model.model_uri,
      model_type="question-answering",
      data=questions,
  )
  mlflow.end_run()
  `;

  return (
    <Modal
      verticalSizing='maxed_out'
      visible={isOpen}
      onCancel={closeModal}
      onOk={closeModal}
      footer={
        <div css={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
          <Button onClick={closeModal} type='primary'>
            <FormattedMessage
              defaultMessage='Okay'
              description='Experiment page > new notebook run modal > okay button label'
            />
          </Button>
        </div>
      }
      title={
        <div>
          <Typography.Title
            level={2}
            css={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs }}
          >
            <FormattedMessage
              defaultMessage='New run using notebook'
              description='Experiment page > new notebook run modal > modal title'
            />
          </Typography.Title>
          <Typography.Hint css={{ marginTop: 0, fontWeight: 'normal' }}>
            Run this code snippet in a notebook or locally, to create an experiment run
          </Typography.Hint>
        </div>
      }
    >
      <Tabs>
        <TabPane
          tab={
            <FormattedMessage
              defaultMessage='Classical ML'
              description='Example text snippet for classical ML'
            />
          }
          key='classical-ml'
        >
          <CodeSnippet
            style={{ padding: '5px' }}
            language='python'
            actions={
              <div
                style={{
                  marginRight: '8px',
                }}
              >
                <CopyButton copyText={classical_ml_text} showLabel={false} icon={<CopyIcon />} />
              </div>
            }
          >
            {classical_ml_text}
          </CodeSnippet>
        </TabPane>
        <TabPane
          tab={<FormattedMessage defaultMessage='LLM' description='Example text snippet for LLM' />}
          key='llm'
        >
          <CodeSnippet
            style={{ padding: '5px' }}
            language='python'
            actions={
              <div
                style={{
                  marginRight: '8px',
                }}
              >
                <CopyButton copyText={llm_text} showLabel={false} icon={<CopyIcon />} />
              </div>
            }
          >
            {llm_text}
          </CodeSnippet>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

const styles = {
  formItem: { marginBottom: 16 },
};
